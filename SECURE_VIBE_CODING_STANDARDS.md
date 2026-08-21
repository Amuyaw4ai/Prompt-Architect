# Master Security & Containerization Governance Framework
> **Secure Vibe Coding & Production Infrastructure Standard (v2.0)**

---

## 1. Executive Summary & Core Mandate

This document establishes the unified **Method of Operation (SOP)** combining **Secure Vibe Coding Risk Management** and **Universal Containerization Standards**. 

Whenever this document (or `Secure Vibe Coding Risk Management.pdf` and `CONTAINERIZATION_STANDARD.md`) is added to any software repository, the AI Editor & Assistant MUST automatically execute the **3-Phase Lifecycle Protocol** outlined below.

---

## 2. The 3-Phase Lifecycle Protocol

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DAY 1 INITIALIZATION & AUDIT                                   │
│  1. Run Security Audit & Dependency Scans (npm audit / vulnerability) │
│  2. Isolate Secrets (Create .env.example, verify process.env)          │
│  3. Generate Governance Artifacts:                                    │
│     - .cursorrules (Security + Container rules)                        │
│     - SECURITY.md & SECURITY_AUDIT.md                                  │
│     - Dockerfile (Multi-stage non-root)                                │
│     - .dockerignore & .gitignore                                       │
│     - docker-compose.yml                                               │
│     - CONTAINERIZATION_STANDARD.md                                     │
│     - README.md & LICENSE                                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: SECURE FEATURE DEVELOPMENT & CONTAINER MAINTENANCE             │
│  1. Parameterized Queries (Zero SQL Injection)                         │
│  2. Strict Server-Side API Secret Isolation                             │
│  3. Rate Limiting & Security Response Headers                          │
│  4. Continuous Docker Synchronization (Keep package.json & Docker      │
│     layers aligned)                                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: GIT HYGIENE & PRODUCTION DEPLOYMENT                            │
│  1. Git Commit Verification (Clean working tree, zero leaked keys)    │
│  2. Automatic Commit & Push to GitHub on major updates                 │
│  3. Tier 3 Scaling Deployment (Cloud Run / Kubernetes manifests)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How Security & Containerization Work Hand-in-Hand

| Domain | Security Requirement | Containerization Requirement | Hand-in-Hand Integration Protocol |
| :--- | :--- | :--- | :--- |
| **Secrets & Keys** | API keys must reside in `process.env`. Never expose in client code. | Secrets must never be baked into Docker build layers. | `.gitignore` AND `.dockerignore` MUST both exclude `.env`, `.env.local`, and secrets. Container receives keys dynamically at runtime via `--env-file` or Cloud Secrets. |
| **Execution Safety** | Restrict privileged system access. | Prevent container breakout attacks. | `Dockerfile` MUST enforce non-root user execution (`USER node` or `USER appuser`). |
| **Networking & Ports** | Protect API endpoints with Rate Limiting & Security Headers. | Isolate container networks and prevent port collisions. | Expose only specific application ports (`EXPOSE 3000`). Bind host-to-container ports explicitly (`-p 3000:3000`). Use internal DNS names inside Docker Compose. |
| **Dependencies** | Fix `npm audit` vulnerabilities before deployment. | Optimize layer caching and minimize container attack surfaces. | Use multi-stage builds (`FROM node:20-alpine AS builder` -> `FROM node:20-alpine AS production`) and install production dependencies only (`npm ci --only=production`). |
| **Version Control** | Keep repository clean; prevent accidental leak of local DBs or logs. | Keep container build contexts small and fast. | Ensure `.dockerignore` mirrors `.gitignore` for `node_modules`, `dist`, `.git`, logs, and temporary databases (`prompts.db`). |

---

## 4. Automatic File Generation Checklist for New/Existing Projects

When initializing or auditing any codebase, the AI Editor MUST automatically create/verify the following files:

- [ ] **`.cursorrules`**: Configuration file equipping the AI assistant with project stack rules, 3-column UI guidelines, step-by-step execution rules, and security/container governance.
- [ ] **`SECURITY.md`**: Public security policy outlining key isolation, vulnerability reporting, and threat mitigations.
- [ ] **`SECURITY_AUDIT.md`**: Empirical audit log of scanned dependencies, rate limits, and header security fixes.
- [ ] **`CONTAINERIZATION_STANDARD.md`**: Universal SOP for Port Space, Docker Compose, Cloud Run, and Kubernetes fleet scaling.
- [ ] **`Dockerfile`**: Multi-stage, non-root, production-ready build instructions.
- [ ] **`.dockerignore`**: Exclusions preventing secrets, build caches, and `.git` from entering Docker images.
- [ ] **`docker-compose.yml`**: Single-command local multi-service stack orchestrator.
- [ ] **`DEPLOYMENT.md`**: Operational guide for Cloud Run and Kubernetes deployments.
- [ ] **`k8s/deployment.yaml` & `k8s/service.yaml`**: Kubernetes production manifests (when scaling to Tier 3).
- [ ] **`.env.example`**: Sanitized template for environment variables.
- [ ] **`README.md` & `LICENSE`**: Comprehensive documentation and open-source license.

---

## 5. Rules Regarding Git & GitHub Commit Hygiene

1. **Atomic Commits**: Every major feature, fix, or security update MUST be committed to local Git.
2. **Automatic Push**: Pushing to remote GitHub (`origin main`) MUST follow major updates to ensure code preservation.
3. **Pre-Push Sanitization**: Before executing `git commit`, verify:
   - `git status` shows zero tracked `.env` or credential files.
   - All secret keys remain in `process.env`.
   - The application builds cleanly (`npm run build`).
