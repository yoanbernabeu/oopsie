#!/bin/sh
set -e

# Generate JWT keys if they don't exist
if [ ! -f config/jwt/private.pem ]; then
    php bin/console lexik:jwt:generate-keypair --skip-if-exists
fi

# Run database migrations
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

exec "$@"
