#!/bin/sh

# Wait for MySQL to be available
echo "Waiting for MySQL..."

while ! php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT}', '${DB_USERNAME}', '${DB_PASSWORD}');" >/dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 3
done

echo "Database is up - running migrations..."

# Run Laravel migrations
php artisan migrate --force

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=8000
