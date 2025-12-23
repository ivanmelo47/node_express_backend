# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including devDependencies for building
# If you have a lockfile, it's better to use 'npm ci'
COPY package-lock.json ./
RUN npm ci

COPY . .

# Build the TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
# Copy other necessary files (like .env example or config if needed, though config is usually code)
COPY --from=builder /app/.sequelizerc ./
COPY --from=builder /app/src/config ./src/config
# Copy migrations and seeders to dist since they are .js files and not compiled
COPY --from=builder /app/src/database/migrations ./dist/database/migrations
COPY --from=builder /app/src/database/seeders ./dist/database/seeders

# Copy system views (HTML files)
# OLD: COPY --from=builder /app/src/modules/system/views ./dist/modules/system/views
# NEW: Copy global views and module assets
COPY --from=builder /app/src/views ./dist/views
COPY --from=builder /app/src/modules/system/public ./dist/modules/system/public
COPY --from=builder /app/src/modules/reports/public ./dist/modules/reports/public

# Copy public static assets
COPY --from=builder /app/public ./public

# Install sequelize-cli globally if needed for migrations in entrypoint, 
# or use npx in the command. 
# Installing globally for convenience if we run it manually.
RUN npm install -g sequelize-cli

EXPOSE 4000

# Start command
CMD ["npm", "run", "start:prod"]
