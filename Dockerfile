FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3300
ENV NOTE_DATA_DIR=/data

EXPOSE 3300
VOLUME ["/data"]

CMD ["npm", "run", "server"]
