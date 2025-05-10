FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

CMD ['bun', 'run', 'start:production']
