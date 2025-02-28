# Build UI
FROM node:20-alpine AS ui-build
WORKDIR /ui
COPY aquarium-ui/package.json aquarium-ui/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY aquarium-ui .
RUN yarn build

# Build Service
FROM node:20-alpine AS service-build
WORKDIR /service
COPY simulation-service/package.json simulation-service/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY simulation-service .
RUN yarn build

# Production image
FROM node:20
WORKDIR /app

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy service files
COPY --from=service-build /service/dist ./dist
COPY --from=service-build /service/node_modules ./node_modules

# Copy UI static files
COPY --from=ui-build /ui/.next/standalone ./ui
COPY --from=ui-build /ui/public ./ui/public
COPY --from=ui-build /ui/.next/static ./ui/.next/static

ENV NODE_ENV=production

EXPOSE 3000

# Create a volume mount point for the database
VOLUME ["/app/data"]

CMD ["node", "--trace-warnings", "--unhandled-rejections=strict", "--inspect=0.0.0.0:9229", "dist/main"]