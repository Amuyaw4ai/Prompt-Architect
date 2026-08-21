# ==========================================
# Prompt Architect Studio - Multi-Stage Dockerfile
# ==========================================

# ------------------------------------------
# Stage 1: Build Frontend & Native Dependencies
# ------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools required for native C++ modules like better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ gcc && rm -rf /var/lib/apt/lists/*

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ------------------------------------------
# Stage 2: Minimal Production Runtime
# ------------------------------------------
FROM node:20-slim AS production

WORKDIR /app

# Install build tools to compile native C++ modules in runtime container
RUN apt-get update && apt-get install -y python3 make g++ gcc && rm -rf /var/lib/apt/lists/*

# Set production environment
ENV NODE_ENV=production

# Copy built node_modules and compiled assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Rebuild native better-sqlite3 module for production runtime container environment
RUN npm rebuild better-sqlite3 --build-from-source

# Security Hardening: Run as unprivileged node user
USER node

# Expose default application port space
EXPOSE 8080 3000

# Start full-stack server using native compiled CommonJS bundle
CMD ["node", "dist/server.cjs"]
