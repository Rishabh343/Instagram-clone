FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve



EXPOSE 3000
CMD ["sh", "-c", "vite preview --host --port ${PORT:-3000}"]