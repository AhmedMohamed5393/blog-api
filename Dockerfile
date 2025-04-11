# For production
# Stage 1: Build the app
# Use Node.js 22.14 as the base image
FROM node:22.14 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install rimraf globally before installing dependencies
RUN npm install -g npm@latest rimraf

# Install dependencies (skip prepare step)
RUN npm install --legacy-peer-deps --ignore-scripts --production=false

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:22.14

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

# Using docker port
EXPOSE $PORT

CMD ["node", "dist/src/main.js"]
