# Build stage
FROM node:22.13-slim AS builder
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV JWT_SECRET="YyCxYYpYPijpXNEPLUqjoj2G642Bjd0txFyyv55486mNL8IpMQKp2cYKswsmrEv0P1qY6UcaNDvGvMZuEB0I1Q=="
ENV DATABASE_URL="postgres://postgres:postgres@localhost:5433/forumgw_svelte"
RUN pnpm run build

# Production stage
FROM node:22.13-slim
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="postgres://postgres:postgres@localhost:5433/forumgw_svelte"
ENV JWT_SECRET="YyCxYYpYPijpXNEPLUqjoj2G642Bjd0txFyyv55486mNL8IpMQKp2cYKswsmrEv0P1qY6UcaNDvGvMZuEB0I1Q=="

CMD ["node", "build"]