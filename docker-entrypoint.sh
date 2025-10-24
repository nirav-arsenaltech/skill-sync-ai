#!/bin/sh

echo "Waiting for MySQL to be available at $DB_HOST:$DB_PORT..."

until php -r "try {
    new PDO('mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
} catch (PDOException \$e) {
    echo 'Waiting for database connection: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}" >/dev/null 2>&1; do
  sleep 3
done

echo "Database connection established."

echo "Running migrations..."
php artisan migrate --force

echo "Linking storage (public/storage)..."
php artisan storage:link || true

echo "Starting Laravel development server..."
php artisan serve --host=0.0.0.0 --port=8000
