# ==========================================
# Prompt Architect Studio - Multi-Stage Dockerfile
# ==========================================

# ------------------------------------------
# Stage 1: Build Frontend & Native Dependencies
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools required for native C++ modules like better-sqlite3
RUN apk add --no-cache python3 make g++

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

# Copy built node_modules and compiled assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Security Hardening: Run as unprivileged node user
USER node

# Expose default application port space
EXPOSE 8080 3000

# Start full-stack server using native compiled ESM bundle
CMD ["node", "dist/server.js"]
