# Universal Containerization & Scaling Method of Operation (SOP)

> **Architectural Standard**: This document is a universal method of operation designed to be copied into any software project repository. It establishes a standardized process for containerizing applications, managing network port space, orchestrating local multi-container development, and scaling seamlessly to production via Kubernetes and Cloud Run.

---

## 1. The Core Scaling Philosophy

In a "dockerless" environment, software deployment suffers from three core bottlenecks:
1. **Inconsistent Environments**: Code runs differently across Windows, macOS, and Linux host systems.
2. **Dependency & Port Conflicts**: Version drift and port collisions break local and staging instances.
3. **Monolithic Scaling Limits**: Inability to scale high-demand services independently.

To solve this, every project adopting this standard follows a 3-tier lifecycle progression:

```
[ Code Repository ] ──> [ Tier 1: Immutable Docker Image ]
                               │
                               ├──> [ Tier 2: Local Orchestration (Docker Compose) ]
                               │
                               └──> [ Tier 3: Production Fleet (Cloud Run / Kubernetes) ]
```

---

## 2. Network Port Space Architecture

Every containerized application operates inside its own isolated network namespace.

### The 16-Bit Port Allocation Standard (0 – 65,535)
- **VIP / System Ports (0 – 1023)**: Reserved for core network standards (`HTTP 80`, `HTTPS 443`, `SSH 22`).
- **Registered Application Ports (1024 – 49151)**: Assigned to specific user services (`Node.js 3000`, `PostgreSQL 5432`, `Redis 6379`).
- **Ephemeral / Dynamic Ports (49152 – 65535)**: Temporary client-side communication sockets.

### Rules of Engagement for Container Network Mapping
1. **Port Isolation**: Containers must not bind directly to host system interfaces without explicit port mapping (`-p HOST_PORT:CONTAINER_PORT`).
2. **Internal DNS Routing**: Inside multi-container networks, services communicate using internal service names (e.g., `http://backend:3000` or `postgres://database:5432`) rather than hardcoded IP addresses.
3. **Port Exhaustion Safeguards**: High-traffic backend services must utilize HTTP keep-alives and connection pooling to prevent ephemeral socket depletion.

---

## 3. Docker Image Engineering Standards

All application Dockerfiles must adhere to the following rules:

### A. Multi-Stage Build Pattern
To maintain minimal production attack surfaces and fast deployment times, image builds must separate the build toolchain from the runtime environment.

### B. Optimal Layer Caching
Order Dockerfile instructions from **least frequently changed** to **most frequently changed**:
1. Base image (`FROM node:20-alpine`)
2. Working directory & package declarations (`WORKDIR`, `COPY package*.json`)
3. Dependency installation (`RUN npm ci --only=production`)
4. Application source code (`COPY . .`)
5. Port exposition & execution command (`EXPOSE`, `CMD`)

### C. Security Hardening
- **Non-Root Execution**: Never run containers as `root`. Specify `USER node` or an unprivileged system user.
- **Secret Hygiene**: Never hardcode API keys or secrets inside a Dockerfile. Pass runtime parameters via environment variables or secret managers.
- **Ignore Rules**: Include a `.dockerignore` file excluding `node_modules`, `.env`, build caches, and `.git` directories.

---

## 4. Tier 1: Single Container Local Execution

To build and run a single application container locally:

```bash
# 1. Build the immutable image snapshot tagged with version v1.0
docker build -t app-name:v1.0 .

# 2. Spin up a live container with isolated port mapping (8080 host -> 3000 container)
docker run -d --name app-instance -p 8080:3000 --env-file .env app-name:v1.0

# 3. Monitor container health & logs
docker ps
docker logs -f app-instance

# 4. Clean teardown
docker stop app-instance && docker rm app-instance
```

---

## 5. Tier 2: Multi-Container Local Orchestration (`docker-compose.yml`)

When an application requires database, caching, or background worker services, local development must be orchestrated via `docker-compose.yml`.

### Architecture Principles:
- **Declarative YAML Configuration**: All services, environment variables, and network bridges defined in code.
- **Persistent Data Volumes**: Ephemeral containers store data on host-mapped volumes (`db_data:/var/lib/postgresql/data`) to preserve database state across container restarts.
- **One-Command Lifecycles**:
  ```bash
  # Boot entire multi-service stack in background
  docker compose up -d

  # Teardown containers while preserving persistent database volumes
  docker compose down
  ```

---

## 6. Tier 3: Production Fleet Scaling (Cloud Run & Kubernetes)

When traffic surges beyond a single host machine, the application shifts to automated container orchestration.

### A. Managed Cloud Container (Google Cloud Run)
- Ideal for serverless scaling with automatic SSL, zero-idle cost scaling, and zero cluster maintenance.
- Command: `gcloud run deploy --image gcr.io/PROJECT_ID/APP_NAME:TAG`

### B. High-Concurrency Production Fleet (Kubernetes / K8s)
For complex multi-region microservice fleets requiring fine-grained control:
1. **Desired State Enforcement**: Kubernetes continuously compares **Actual State** against the **Desired State** declared in YAML manifests.
2. **Self-Healing & Auto-Recovery**: If a node or pod crashes, the Control Plane (`API Server` + `kube-scheduler`) automatically reschedules replacement pods on healthy worker nodes.
3. **Static Traffic Cop (Kubernetes Service)**: Abstracts shifting Pod IP addresses behind a stable, load-balanced virtual IP.
4. **Rolling Updates**: Deploys new container versions (`v2.0`) incrementally with zero downtime.

---

## 7. Universal Project Implementation Checklist

Whenever initializing a new codebase or scaling an existing project:

- [ ] Add `.dockerignore` excluding `.env`, `node_modules`, `dist/`, `.git`.
- [ ] Create multi-stage `Dockerfile` with non-root security.
- [ ] Create `docker-compose.yml` for single-command local multi-service testing.
- [ ] Add `k8s/` or Cloud Run deployment manifests for production scaling.
- [ ] Verify build via `docker build` and test port mapping locally.
