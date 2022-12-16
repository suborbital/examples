FROM node:18 as builder

WORKDIR /tmp

COPY package*.json ./
RUN npm ci

COPY public public
COPY src src
COPY backend backend

COPY astro.config.mjs ./
COPY tsconfig.json ./

RUN npm run build


FROM node:18 as app

WORKDIR /app

COPY --from=builder /tmp/node_modules node_modules
COPY --from=builder /tmp/backend backend
COPY --from=builder /tmp/www www
COPY --from=builder /tmp/package.json package.json

ENV SUBORBITAL_ENV="default.dev"

WORKDIR ./app
ENTRYPOINT npm run serve
