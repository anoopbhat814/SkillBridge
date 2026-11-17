FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install && npm run build --workspace @skillbridge/web

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@skillbridge/web"]
