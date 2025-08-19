FROM node:22-alpine

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

RUN npm install

# Copiar todo el código
COPY . .

# Copiar entrypoint.sh
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 3000

CMD ["/usr/src/app/entrypoint.sh"]
