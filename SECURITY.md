# Security Policy & Vulnerability Disclosure

Prompt Architect prioritizes the security and privacy of its users, API credentials, and data pipelines.

## Supported Versions

| Version | Supported          | Security Maintenance Status |
| ------- | ------------------ | --------------------------- |
| `1.x`   | :white_check_mark: | Active                      |
| `< 1.0` | :x:                | Unsupported                 |

## Reporting a Vulnerability

If you discover a security vulnerability or credential exposure risk in Prompt Architect, please **do not** open a public issue.

Instead, please report security issues directly:

1. **Email**: Send details to `princeamuyaw18@gmail.com` or open a private security advisory on GitHub.
2. **Details to include**:
   - Type of issue (e.g. Secret leakage, XSS, SSRF, Rate limiting bypass, Dependency vulnerability).
   - Step-by-step instructions or proof-of-concept to reproduce.
   - Potential impact of the vulnerability.

We aim to respond to security reports within **24–48 hours** and provide periodic updates until the issue is patched.

## Security Best Practices for Deployment

### 1. Environment Secrets & API Keys
- Never commit `.env` or real API keys (e.g., `GEMINI_API_KEY`) to Git repositories.
- Use `.env.example` as a reference template for local configuration.
- In production environments (Docker, Vercel, GCP, Railway), set `GEMINI_API_KEY` via encrypted environment variable managers or secret stores.

### 2. HTTP Security Headers
The server enforces essential HTTP security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 3. Rate Limiting & Input Validation
- Server endpoints (`/api/refine`, `/api/transform`) impose body size limits (`50mb` max for base64 multi-modal assets) and sanitized error handlers to prevent internal detail disclosure.
- SQLite query parameters are bound safely to prevent SQL injection.

### 4. Multi-Modal Upload Ceilings & Product Governance
- Uploads are bound by Free Tier size ceilings: **10 MB** (Images/Documents), **25 MB** (Videos), **15 MB** (Audio).
- Oversized uploads trigger an immediate Pro Upgrade alert blocking invalid model payloads.
- Governance standards and monetization roadmaps are maintained in [`SECURE_VIBE_CODING_STANDARDS.md`](file:///C:/Users/princ/antigravity/Prompt-Architect/SECURE_VIBE_CODING_STANDARDS.md) and [`PRODUCT_ROADMAP_AND_MONETIZATION.md`](file:///C:/Users/princ/antigravity/Prompt-Architect/PRODUCT_ROADMAP_AND_MONETIZATION.md).
