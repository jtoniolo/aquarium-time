# Build Service
FROM node:20-alpine AS service-build
WORKDIR /service
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production image
FROM node:20-alpine as serve
WORKDIR /app
# Copy service files
COPY --from=service-build /service/dist ./dist
COPY --from=service-build /service/node_modules ./node_modules

RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 3000

VOLUME ["/app/data"]
CMD ["node", "--trace-warnings", "--unhandled-rejections=strict", "dist/main"]