# ============================================
# Stage 1 — Dependencies
# ============================================
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install **all dependencies** including devDependencies for build
RUN npm ci --include=dev && npm cache clean --force


# ============================================
# Stage 2 — Builder
# ============================================
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


# ============================================
# Stage 3 — Runtime
# ============================================
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
