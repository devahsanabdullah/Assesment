FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json vite.config.ts index.html ./
RUN npm install

COPY src ./src

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]