FROM node:18-alpine
WORKDIR /app

# 1) Копируем package.json, tsconfig и папку prisma (с миграциями!)
COPY package*.json tsconfig*.json ./
COPY prisma ./prisma

# 2) Устанавливаем и генерируем клиента
RUN npm ci && npx prisma generate

# 3) Копируем остальной код и билдим
COPY . .
RUN npm run build

EXPOSE 3000

# 4) Применяем миграции и стартуем сервер
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
