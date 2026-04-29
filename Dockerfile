# syntax=docker/dockerfile:1
# Use official bun image (debian variant) so bun is pre-installed
FROM oven/bun:1-debian AS base

# Install Ghostscript (for server-side PDF compression)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install

# ── Build ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args injected by Cloud Build / gcloud run deploy
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ── Runner ──────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built artifacts and required runtime files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Cloud Run injects PORT (default 8080) — use shell form so $PORT is evaluated
CMD node_modules/.bin/next start -p ${PORT:-3000}
