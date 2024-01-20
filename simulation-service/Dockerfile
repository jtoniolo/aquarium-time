# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# ---- Serve ----
FROM node:20-alpine AS serve
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
#COPY package.json yarn.lock ./
#RUN yarn install --production --frozen-lockfile

EXPOSE 3000
CMD ["node", "dist/main"]