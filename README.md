# next.js-ci-cd
## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Project Structure](#-project-structure)
- [Docker Setup](#-docker-setup)
- [Build & Run with Docker](#️-build--run-with-docker)
- [Push Image to GHCR](#️-push-image-to-github-container-registry-ghcr)
- [Kubernetes Setup (Minikube)](#️-kubernetes-setup-minikube)
- [Example Kubernetes Manifests](#-example-kubernetes-manifests)
- [CI/CD (GitHub Actions)](#️-cicd-github-actions)
- [Useful Commands](#-useful-commands)
- [Best Practices](#-best-practices)
- [Architecture](#-example-architecture)
- [Cleanup](#-cleanup)
- [Author](#-author)

## Project Overview
[Project Overview](#-project-overview)
Project Overview

This project demonstrates a full CI/CD pipeline for a Next.js application using Docker, GitHub Actions, and Minikube (Kubernetes).

It includes:

Building the Next.js app automatically on each push

Running OWASP dependency checks and saving the report

Building and scanning a Docker image with Trivy

Pushing the image to GitHub Container Registry (GHCR)

Deploying locally on Kubernetes using Minikube


#Project Structure
```
next.js-ci-cd/
├── webapp/                 # Next.js app source
│   ├── package.json
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
├── Dockerfile
└── README.md
```
# GitHub Actions Workflow

The CI/CD pipeline runs automatically on each push to the main branch and performs:

Lint & static checks

OWASP dependency scan

Docker image build & Trivy scan

Push image to GHCR

Upload OWASP report artifact

# Docker Setup
## Dependancy
## Builder
## Runner

# Trivy

# Kubernetees 
# Minikube

# Add-Ons
## Helm
## Email/ Slack


