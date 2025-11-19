FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite app
RUN npm run build

# Expose the port you want to use
EXPOSE 3000

# Run Vite preview in production mode, bind to all interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
