# Stage 1: Build Angular Frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Build Laravel Backend with FrankenPHP
FROM dunglas/frankenphp:1-php8.2.25-bookworm
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql mbstring zip opcache pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy backend files
COPY backend /app

# Copy .env if exists (or rely on volume/env vars)
# COPY backend/.env.example /app/.env

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Octane
RUN php artisan octane:install --server=frankenphp

# Copy built Angular files to public folder
# We'll serve Angular from the root and Laravel from /api
COPY --from=frontend-builder /app/dist/lapor-ac/browser /app/public/frontend
# Note: Check if outputPath is dist/lapor-ac or dist/lapor-ac/browser (Angular 17+ uses browser subfolder)
# In angular.json it was dist/lapor-ac. Let's adjust if needed.
# Let's try to copy everything from dist/lapor-ac

RUN rm -rf /app/public/frontend && mkdir -p /app/public/frontend
COPY --from=frontend-builder /app/dist/lapor-ac /app/public/frontend

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Post build optimization
RUN php artisan optimize

EXPOSE 80 443

# Start Octane with FrankenPHP
CMD ["php", "artisan", "octane:frankenphp", "--host=0.0.0.0", "--port=80", "--admin-port=2019"]


