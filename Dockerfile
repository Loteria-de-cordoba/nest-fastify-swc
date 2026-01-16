# syntax=docker/dockerfile:1

############################
# Base deps (dev deps)
############################
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

############################
# Build (compila dist)
############################
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

############################
# Production deps (solo prod deps)
############################
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

############################
# Production runtime
############################
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 3000
# Nest build típico: dist/main.js
CMD ["node", "dist/main.js"]

############################
# Development runtime
############################
FROM node:22-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
