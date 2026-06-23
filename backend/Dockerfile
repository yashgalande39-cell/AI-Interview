# Production-grade Multi-stage Dockerfile for TRESK AI Backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency definitions and lockfile
COPY package*.json ./

# Install all dependencies (including devDependencies for build if needed)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Stage 2: Create runtime container
FROM node:18-alpine AS runner

WORKDIR /app

# Configure default env values
ENV NODE_ENV=production
ENV PORT=5000

# Copy node modules and sources from the builder stage
COPY --from=builder /app ./

# Expose backend port
EXPOSE 5000

# Execute server startup
CMD ["npm", "start"]
