# Prompt Architect Studio - Deployment & Scaling Guide

This guide provides operational step-by-step commands to build, run, and scale **Prompt Architect Studio** across local Docker environments, Google Cloud Run, and Kubernetes.

---

## 1. Local Container Execution (Tier 1)

### Build the Production Image
```bash
docker build -t prompt-architect:v2.0.0 .
```

### Run Container Locally
```bash
docker run -d \
  --name prompt_architect_app \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key_here" \
  prompt-architect:v2.0.0
```
Open browser at `http://localhost:3000`.

---

## 2. Local Multi-Service Orchestration with Docker Compose (Tier 2)

### Start Stack
```bash
docker compose up -d
```

### Stop Stack
```bash
docker compose down
```

---

## 3. Deployment to Google Cloud Run (Recommended Cloud Option)

Google Cloud Run automatically handles container building, SSL certificates, zero-idle cost scaling, and public routing.

### Step 1: Submit Container Image to Google Artifact Registry
```bash
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/prompt-architect:v2.0.0
```

### Step 2: Deploy Container to Cloud Run
```bash
gcloud run deploy prompt-architect \
  --image gcr.io/YOUR_GCP_PROJECT_ID/prompt-architect:v2.0.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_api_key_here"
```

Cloud Run will output your live secure HTTPS URL (e.g. `https://prompt-architect-xyz.a.run.app`).

---

## 4. Scaling to Production Kubernetes / GKE (Tier 3)

For large-scale, multi-pod clusters on Google Kubernetes Engine (GKE) or standard K8s:

### Step 1: Create Kubernetes API Secret
```bash
kubectl create secret generic prompt-architect-secrets \
  --from-literal=gemini-api-key="your_api_key_here"
```

### Step 2: Apply Deployment & Service Manifests
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Step 3: Monitor Cluster Health
```bash
kubectl get pods -l app=prompt-architect
kubectl get service prompt-architect-service
```

---

## 5. Automated GitHub Release & Version Tagging (Tier 4)

To automatically generate published GitHub Releases with changelogs:

### Push Version Tag
```bash
git tag -a v1.0.4 -m "Release v1.0.4: Production UI polish, single-line tooltips & security enhancements"
git push origin v1.0.4
```
Pushing the tag triggers `.github/workflows/release.yml`, executing build verification and publishing a formal Release entry on GitHub.
