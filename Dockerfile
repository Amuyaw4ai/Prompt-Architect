# ==========================================
# Prompt Architect Studio - Multi-Stage Dockerfile
# ==========================================

# ------------------------------------------
# Stage 1: Build Frontend & Assets
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled frontend build & server assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/utils/contextualFrameworks.ts ./src/utils/contextualFrameworks.ts

# Security Hardening: Run as unprivileged node user
USER node

# Expose default application port space
EXPOSE 3000

# Healthcheck to ensure container availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start full-stack server
CMD ["npx", "tsx", "server.ts"]
