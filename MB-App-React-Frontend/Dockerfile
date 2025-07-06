FROM node:18

WORKDIR /app

# Copy package.json + lock first
COPY package*.json ./

# Ensure devDependencies are installed
ENV NODE_ENV=development
RUN npm install

# Now copy the rest
COPY . .

# Build the app
RUN npm run build

# Use serve for static files (optional, for final image)
RUN npm install -g serve

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]