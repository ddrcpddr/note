FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ARG GIT_COMMIT=local
ARG BUILD_TIME=local

ENV NODE_ENV=production
ENV PORT=3300
ENV NOTE_DATA_DIR=/data
ENV NOTE_BUILD_COMMIT=$GIT_COMMIT
ENV NOTE_BUILD_TIME=$BUILD_TIME

EXPOSE 3300
VOLUME ["/data"]

CMD ["npm", "run", "server"]
