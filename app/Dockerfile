FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 8081

ENV EXPO_NO_TELEMETRY=1
ENV CI=1

CMD ["npx", "expo", "start", "--web", "--port", "8081"]
