FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY prisma ./prisma
RUN npm install && npx prisma generate && npm run build --workspace @skillbridge/api

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
