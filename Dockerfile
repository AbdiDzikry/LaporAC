# Gunakan image resmi FrankenPHP dengan PHP 8.2
FROM dunglas/frankenphp:1-php8.2.25

# ENV SERVER_NAME=app02.localhost
# Set working directory
WORKDIR /app
COPY . /app
RUN cd /app
RUN cp $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini
#ENV FRANKENPHP_CONFIG="worker /app/public/index.php 1"
# Install dependencies
RUN apt update && apt install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \  
    git \
    unzip \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt install -y nodejs \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pcntl mbstring pdo_mysql mysqli opcache

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
COPY .env /app/.env

# Copy project files ke dalam container

RUN sed -i'' -e 's/^APP_ENV=.*/APP_ENV=production/' -e 's/^APP_DEBUG=.*/APP_DEBUG=false/' .env

# Set permissions untuk Laravel
RUN chown -R www-data:www-data /app && chmod -R 775 /app

# Install Laravel dependencies (dengan Composer)
RUN composer install --ignore-platform-reqs --no-dev -a
RUN composer require laravel/octane 
RUN php artisan octane:install --server=frankenphp
# COPY --from=caddy /usr/bin/caddy /usr/bin/caddy
RUN php artisan optimize
# Copy Caddyfile ke dalam container
COPY Caddyfile /app/Caddyfile
# Expose port untuk Caddy
EXPOSE 80/tcp 443/tcp

# Jalankan Caddy dan FrankenPHP
CMD ["php", "artisan","octane:frankenphp", "--workers=4", "--max-requests=1000","--admin-port=2000","--port=80"]


