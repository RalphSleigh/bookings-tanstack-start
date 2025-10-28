FROM node:lts-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the nitro app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Create an optimised runner image
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro
COPY --from=builder /app/.output ./.output
COPY package.json ./
USER nitro
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV IN_CONTAINER=true
CMD ["node", ".output/server/index.mjs"]