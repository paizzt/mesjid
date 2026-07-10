# Tahap 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Gunakan --no-empty-out-dir karena dist default kosong
RUN npm run build

# Tahap 2: Setup Backend & Serve
FROM node:18-alpine
WORKDIR /app

# Copy package backend dan install dependencies production
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Copy source code backend
COPY backend/ ./

# Copy hasil build frontend ke folder dist di dalam backend
COPY --from=frontend-builder /app/frontend/dist ./dist

# Ekspos port default
EXPOSE 3000

# Jalankan server production
CMD ["node", "app.js"]
