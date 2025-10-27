# Use an official PHP image with Composer preinstalled
FROM php:8.3-fpm

# Install system dependencies and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    default-mysql-client \
    # PDF text extraction (for spatie/pdf-to-text)
    poppler-utils \
    # DOC -> TXT conversion
    libreoffice \
    fonts-dejavu \
    # For PHPWord (XML & Zip)
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd zip pdo_mysql xml \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer (if not included)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Node.js (for Laravel Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-scripts --no-interaction --prefer-dist

# Build frontend assets
RUN npm ci && npm run build

# Ensure writable permissions for Laravel
RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Create the public storage symlink
RUN php artisan storage:link || true

# Expose Laravel port
EXPOSE 8000

# Copy the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Verify LibreOffice and pdftotext installed
RUN which soffice && which pdftotext

# Use the entrypoint script as CMD
ENTRYPOINT ["docker-entrypoint.sh"]
