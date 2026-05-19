FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

# Production server ổn định hơn next dev trong Docker (tránh crash/reset khi compile)
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
