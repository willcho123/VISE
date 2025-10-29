# Imagen base con Node.js
FROM node:18-alpine

# Crear directorio de la app en el contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar dependencias (solo producción por defecto)
RUN npm install --only=production

# Copiar el resto del código de la app
COPY . .

# Exponer puerto (el mismo que usas en server.js)
EXPOSE 443

# Comando de inicio
CMD ["node", "server.js"]
