# syntax=docker/dockerfile:1
FROM node:24.19.0-bookworm-slim AS web-build
WORKDIR /app
RUN npm install --global npm@10.9.2
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.28.0-alpine AS web
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=web-build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

FROM node:24.19.0-bookworm-slim AS api-dependencies
WORKDIR /app
RUN npm install --global npm@10.9.2
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:24.19.0-bookworm-slim AS api
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3081 DATA_DIR=/app/data \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=api-dependencies /app/node_modules ./node_modules
COPY api/ ./
RUN node node_modules/playwright/cli.js install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3081
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3081/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
