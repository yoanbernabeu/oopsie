FROM dunglas/frankenphp:1-php8.4-bookworm AS base

RUN install-php-extensions \
    pdo_pgsql \
    intl \
    opcache \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install dependencies first (layer caching)
FROM base AS deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Production image
FROM base AS production

ENV APP_ENV=prod
ENV APP_DEBUG=0
ENV SERVER_NAME=:80

COPY . /app
COPY --from=deps /app/vendor /app/vendor

RUN composer dump-autoload --optimize --classmap-authoritative && \
    php bin/console cache:clear --env=prod && \
    php bin/console assets:install --env=prod

# Generate JWT keys if not present
RUN mkdir -p config/jwt

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
