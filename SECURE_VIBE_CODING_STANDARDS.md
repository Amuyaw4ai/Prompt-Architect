# Master Security & Containerization Governance Framework
> **Secure Vibe Coding & Production Infrastructure Standard (v2.0)**

---

## 1. Executive Summary & Core Mandate

This document establishes the universal **Method of Operation (SOP)** combining **Secure Vibe Coding Risk Management** and **Universal Containerization Standards**. 

Whenever this document (or `Secure Vibe Coding Risk Management.pdf` and `CONTAINERIZATION_STANDARD.md`) is added to any software repository, the AI Editor & Assistant MUST automatically execute the **3-Phase Lifecycle Protocol** outlined below.

---

## 2. The 3-Phase Lifecycle Protocol

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DAY 1 INITIALIZATION & AUDIT                                   │
│  1. Run Security Audit & Dependency Scans (vulnerability auditing)     │
│  2. Isolate Secrets (Create .env.example, verify process.env)          │
│  3. Generate Governance Artifacts:                                    │
│     - .cursorrules (Security + Container rules tailored to project)    │
│     - SECURITY.md & SECURITY_AUDIT.md                                  │
│     - Dockerfile (Multi-stage non-root container build)                │
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
│  4. Continuous Docker Synchronization (Keep dependencies and container │
│     layers aligned)                                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: GIT HYGIENE & PRODUCTION DEPLOYMENT                            │
│  1. Git Commit Verification (Clean working tree, zero leaked keys)    │
│  2. Automatic Commit & Push to GitHub on major updates                 │
│  3. Production Scaling Deployment (Cloud Run / Kubernetes manifests)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How Security & Containerization Work Hand-in-Hand

| Domain | Security Requirement | Containerization Requirement | Hand-in-Hand Integration Protocol |
| :--- | :--- | :--- | :--- |
| **Secrets & Keys** | API keys must reside in `process.env`. Never expose in client code. | Secrets must never be baked into Docker build layers. | `.gitignore` AND `.dockerignore` MUST both exclude `.env`, `.env.local`, and credentials. Container receives keys dynamically at runtime via environment files or Cloud Secrets. |
| **Execution Safety** | Restrict privileged system access. | Prevent container breakout attacks. | `Dockerfile` MUST enforce non-root user execution (`USER node`, `USER appuser`, or unprivileged system accounts). |
| **Networking & Ports** | Protect API endpoints with Rate Limiting & Security Headers. | Isolate container networks and prevent port collisions. | Expose only specific application ports (`EXPOSE PORT`). Bind host-to-container ports explicitly (`-p HOST_PORT:CONTAINER_PORT`). Use internal service DNS inside orchestration files. |
| **Dependencies** | Fix package vulnerabilities before deployment. | Optimize layer caching and minimize container attack surfaces. | Use multi-stage builds (`builder` -> `production`) and install production dependencies only. |
| **Version Control** | Keep repository clean; prevent accidental leak of local data or logs. | Keep container build contexts small and fast. | Ensure `.dockerignore` mirrors `.gitignore` for dependencies, build output, version control logs, and temporary storage files. |

---

## 4. Automatic File Generation Checklist for New/Existing Projects

When initializing or auditing any codebase, the AI Editor MUST automatically create and verify the following project-specific files:

- [ ] **`.cursorrules`**: Project-level instructions equipping the AI assistant with tech stack rules, UI/UX guidelines, step-by-step execution preferences, and security/container governance.
- [ ] **`SECURITY.md`**: Public security policy outlining key isolation, vulnerability reporting, and threat mitigations.
- [ ] **`SECURITY_AUDIT.md`**: Empirical audit log of scanned dependencies, rate limits, and header security fixes.
- [ ] **`CONTAINERIZATION_STANDARD.md`**: Universal SOP for Port Space, Docker Compose, Cloud Run, and Kubernetes fleet scaling.
- [ ] **`Dockerfile`**: Multi-stage, non-root, production-ready container build instructions tailored to the project's runtime environment.
- [ ] **`.dockerignore`**: Exclusions preventing secrets, build caches, and version control files from entering Docker images.
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
   - All secret keys remain strictly in `process.env`.
   - The application builds cleanly and passes all build checks.
