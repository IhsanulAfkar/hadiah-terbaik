# Stage 1: Build & Prune
FROM node:18-alpine AS builder
WORKDIR /app

# Add network resilience settings for build
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set maxsockets 1

COPY package*.json ./
COPY . .
# Generate Client, Backup it, Prune to Prod, then Restore
RUN npx prisma generate
# Backup generated client because npm prune removes it (extraneous)
RUN cp -R node_modules/.prisma /tmp/.prisma
RUN npm prune --production
# Restore generated client
RUN cp -R /tmp/.prisma node_modules/.prisma

# Stage 2: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY . .

# Copy production node_modules from builder (No network request needed)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3100
CMD ["npm", "start"]
