# Multi-stage production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built dependencies and app code
COPY --from=builder /app ./

# Create persistent storage directories
RUN mkdir -p database uploads logs

EXPOSE 5000

CMD ["node", "backend/server.js"]
