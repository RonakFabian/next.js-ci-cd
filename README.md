# next.js-ci-cd
## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Docker Setup](#docker-setup)
- [Kubernetes](#Kubernetes)

  



## [Project Overview](#-project-overview)


This project demonstrates a full CI/CD pipeline for a Next.js application using Docker, GitHub Actions, and Minikube (Kubernetes).

It includes:

- Building the Next.js app automatically on each push
- Running OWASP dependency checks and saving the report
- Building and scanning a Docker image with Trivy
- Pushing the image to GitHub Container Registry (GHCR)
- Deploying locally on Kubernetes using Minikube


# [Project Structure](#-project-structure)
```
next.js-ci-cd/
├── webapp/                 # Next.js app source
│   ├── package.json
│   ├── Dockerfile
│   ├── next.config.js
│   ├── public/
│   └── pages/
│
├── k8s/                    # Kubernetes manifests
│   ├── deployment.yaml
│   └── service.yaml
│
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions workflow
│
├── 
└── README.md
```
# [GitHub Actions Workflow](#-github-actions-workflow)

- Checkout repo — fetch your source code
  ```
  - name: Checkout code
  uses: actions/checkout@v4
  ```

- Setup Node — Node 20 installed for linting and npm audit
  ```
  - name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
  ```

- Cache node_modules — speeds up CI runs
  ```
  - name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: ./webapp/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('webapp/package-lock.json') }}
  ```

- Install dependencies  and Lint  
  ```
  - name: Install dependencies
  run: npm ci
  working-directory: ./webapp
  ```

- Dependency scan — OWASP Dependency Check 
  ```
  - name: Run OWASP Dependency-Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: "nextjs-ci-cd"
    path: "./webapp"
    format: "HTML"
  ```

- Upload dependency report as an artifact
  ```
  - name: Upload Test results
  uses: actions/upload-artifact@master
  with:
    name: Depcheck report
    path: ${{github.workspace}}/reports
  ```

- Login to GHCR (docker/login-action)
  ```
  - name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
  ```

- Build Docker image from webapp/ and tag as ${REPO_NAME}:latest
  ```
  - name: Build and push Docker image
  run: docker build -t $REPO_NAME:latest ./webapp
  ```

- Scan image with Trivy 
  ```
  - name: Scan Docker image
  uses: aquasecurity/trivy-action@0.33.1
  with:
    image-ref: ${{ env.REPO_NAME }}:latest
  ```

- Tag with short SHA (first 7 characters) and push both tags to GHCR
  ```
  - name: Tag and Push Docker image
  run: |
    SHORT_SHA=${GITHUB_SHA::7}
    docker tag $REPO_NAME:latest $REPO_NAME:$SHORT_SHA
    docker push $REPO_NAME:latest
    docker push $REPO_NAME:$SHORT_SHA
  ```

# [Docker Setup](#-docker-setup)
## Dependancy-
Stage 1: Install dependencies including devDependencies.
```
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install **all dependencies** including devDependencies for build
RUN npm ci --include=dev && npm cache clean --force
```
## Builder
Stage 2: Build Next.js app using Turbopack (Next 15).
```
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy entire app
COPY . .

# Set environment vars for build
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Build the app using Turbopack (Next 15)
RUN npm run build
```
## Runner
Stage 3: Runtime container using non-root user.
```
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# Use non-root user
USER node

# Set environment vars
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80

# Copy built app and dependencies
COPY --from=builder /app/package.json ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 80

# Start the Next.js production server
CMD ["npx", "next", "start", "-p", "80"]
```

# [Kubernetes](#-Kubernetes)
Kubernetes Local Setup with Minikube
## Setup Minikube
Start Minikube: (Using dockerized version)
```
minikube start --driver=docker
```
## Deployment
```
apiVersion: apps/v1  # Kubernetes API version for deployments
kind: Deployment     # Deployment ensures desired number of pod replicas run
metadata:
  name: nextjs-deployment  # Name of the deployment
spec:
  replicas: 1  # Number of pod replicas
  selector:
    matchLabels:
      app: nextjs  # Must match the labels of the pods; used for selection
  template:
    metadata:
      labels:
        app: nextjs  # Labels for pods; should match the selector above
    spec:
      containers:
        - name: nextjs-container  # Container name inside the pod
          image: ghcr.io/ronakfabian/nextjs-ci-cd:a5a3f85  # Container image to deploy
          imagePullPolicy: IfNotPresent  # Only pull if not present locally
          ports:
            - containerPort: 80  # Port exposed by container
          resources:  # Resource requests and limits help Kubernetes schedule pods efficiently
            requests:
              memory: "128Mi"  # Minimum memory guaranteed
              cpu: "250m"      # Minimum CPU guaranteed (0.25 CPU)
            limits:
              memory: "256Mi"  # Maximum memory allowed
              cpu: "500m"      # Maximum CPU allowed (0.5 CPU)
          livenessProbe:  # Checks if container is alive; restarts if unhealthy
            httpGet:
              path: /  # Endpoint to check
              port: 80
            initialDelaySeconds: 30  # Wait before first probe
            periodSeconds: 10         # Frequency of probe
          readinessProbe:  # Checks if container is ready to accept traffic
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 10  # Wait before first probe
            periodSeconds: 5         # Frequency of probe
```

## Service
```
apiVersion: v1  # Kubernetes API version for Services
kind: Service   # Service exposes pods to network (internal or external)
metadata:
  name: nextjs-service  # Name of the service
spec:
  selector:
    app: nextjs  # Selects pods with this label; must match Deployment labels
  ports:
    - protocol: TCP  # Network protocol
      port: 80       # Port exposed by the service
      targetPort: 80 # Port on the pod container to forward traffic to
  type: NodePort     # Exposes the service on a random port on each node (for local/dev access)
```
Apply Deployment & Service:
```
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```
Check Status:
```
kubectl get pods       # See if pods are running
kubectl get deployments  # Check deployment status
kubectl get svc        # Get service info including NodePort
```
Access the website using Minikube tunnel:
```
minikube tunnel
```
Debugging:
```
kubectl describe pod <pod-name>   # Detailed pod info
kubectl logs <pod-name>           # Container logs
kubectl get events                # Check for issues in cluster
```

# Add-Ons

## Helm
Helm is a package manager for Kubernetes that simplifies deployment and management of applications. Using Helm charts, you can **install, upgrade, and rollback apps** easily without writing long YAML files. In the future, adding Helm charts for this project can **automate deployments and standardize configurations**.

## Email / Slack Notifications
Integrating email or Slack notifications allows your cluster to **alert you on events** like deployment success, pod failures, or scaling actions. Future enhancements could include:
- Slack notifications for pod status changes.
- Email alerts for deployment failures or resource limits.
- Integration with CI/CD pipelines for real-time feedback.


