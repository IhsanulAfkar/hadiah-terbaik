# Stage 1: Build
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
# Configure npm timeout to handle slow connections
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set maxsockets 1 

# Install dependencies using clean install for speed and consistency
RUN npm ci
COPY . .

# Accept the API URL from build args (passed from docker-compose/Portainer)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
