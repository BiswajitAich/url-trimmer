FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json postcss.config.mjs tailwind.config.ts ./
RUN npm install

COPY . .

# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]