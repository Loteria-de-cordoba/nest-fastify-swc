# syntax=docker/dockerfile:1

FROM node:26.13.0-alpine AS base

FROM base AS npm-base
RUN npm install --global --ignore-scripts npm@12.2.1

############################
# Base deps (dev deps)
############################
FROM npm-base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

############################
# Build (compila dist)
############################
FROM npm-base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

############################
# Production deps (solo prod deps)
############################
FROM npm-base AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

############################
# Production runtime
############################
FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]

############################
# Development runtime
############################
FROM npm-base AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
