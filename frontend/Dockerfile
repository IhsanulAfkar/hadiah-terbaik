# Stage 1: Build
FROM node:18-slim AS builder
WORKDIR /app

COPY package*.json ./

# Optional npm network tuning
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set maxsockets 1 

RUN npm ci
COPY . .

# Accept API URL from docker-compose
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# Stage 2: Serve with "serve"
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (match docker-compose mapping)
EXPOSE 3105

# Start static server
CMD ["serve", "-s", "dist", "-l", "3105"]