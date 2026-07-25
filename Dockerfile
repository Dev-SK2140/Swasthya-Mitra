FROM node:20-alpine

WORKDIR /app

# Copy root and package definitions
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server and client dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy application source
COPY . .

# Build client production bundle
RUN npm run build --prefix client

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server/server.js"]
