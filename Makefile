.DEFAULT_GOAL := help

# ——————————————————————————————————————————————————
# Oopsie — Development Makefile
# ——————————————————————————————————————————————————

## —— Setup ——————————————————————————————————————————

.PHONY: install
install: install-server install-dashboard install-docs install-sdk ## Install all dependencies
	@echo "\033[32m✓ All dependencies installed.\033[0m"

.PHONY: install-server
install-server: ## Install server (Symfony) dependencies
	cd server && composer install
	@if [ ! -f server/config/jwt/private.pem ]; then \
		cd server && symfony console lexik:jwt:generate-keypair --skip-if-exists 2>/dev/null || true; \
		echo "\033[32m✓ JWT keypair ready\033[0m"; \
	fi

.PHONY: install-dashboard
install-dashboard: ## Install dashboard (Next.js) dependencies
	cd dashboard && npm install

.PHONY: install-docs
install-docs: ## Install docs (Astro) dependencies
	cd docs && npm install

.PHONY: install-sdk
install-sdk: ## Install SDK dependencies
	cd sdk && npm install

## —— Development ————————————————————————————————————

.PHONY: dev
dev: db ## Start all dev services in parallel (Ctrl+C to stop)
	@echo ""
	@echo "  \033[1mOopsie Dev Environment\033[0m"
	@echo "  ─────────────────────────────────"
	@echo ""
	@# 1) Database & JWT setup
	@cd server && symfony console doctrine:database:create --if-not-exists -q 2>/dev/null || true
	@cd server && symfony console doctrine:migrations:migrate --no-interaction -q 2>/dev/null || true
	@cd server && symfony console lexik:jwt:generate-keypair --skip-if-exists -q 2>/dev/null || true
	@echo "  \033[32m✓ Database & JWT ready\033[0m"
	@# 2) Start Symfony server as a daemon (picks a free port)
	@cd server && symfony serve --no-tls --daemon 2>/dev/null || true
	@# 3) Extract the server URL from symfony server:status
	@SERVER_URL=$$(cd server && symfony server:status 2>&1 | grep -oE 'http://127\.0\.0\.1:[0-9]+' | head -1); \
	if [ -z "$$SERVER_URL" ]; then \
		echo "  \033[31m✗ Could not detect Symfony server URL.\033[0m"; \
		exit 1; \
	fi; \
	echo "  \033[33m[server]\033[0m    $$SERVER_URL"; \
	echo "NEXT_PUBLIC_API_URL=$$SERVER_URL/api/v1" > dashboard/.env.local; \
	echo "  \033[32m✓ dashboard/.env.local → $$SERVER_URL/api/v1\033[0m"; \
	echo ""; \
	trap 'cd server && symfony server:stop 2>/dev/null; rm -f dashboard/.env.local; kill 0' EXIT; \
	(cd dashboard && npm run dev 2>&1 | while IFS= read -r line; do echo "\033[34m[dashboard]\033[0m $$line"; done) & \
	(cd docs && npm run dev 2>&1 | while IFS= read -r line; do echo "\033[35m[docs]\033[0m      $$line"; done) & \
	wait

.PHONY: dev-server
dev-server: db ## Start server only (Symfony CLI + PostgreSQL)
	cd server && symfony serve --no-tls

.PHONY: dev-dashboard
dev-dashboard: ## Start dashboard only (needs server running)
	@SERVER_URL=$$(cd server && symfony server:status 2>&1 | grep -oE 'http://127\.0\.0\.1:[0-9]+' | head -1); \
	if [ -z "$$SERVER_URL" ]; then \
		echo "\033[31m✗ Symfony server not running. Start it first: make dev-server\033[0m"; \
		exit 1; \
	fi; \
	echo "NEXT_PUBLIC_API_URL=$$SERVER_URL/api/v1" > dashboard/.env.local; \
	echo "\033[32m✓ dashboard/.env.local → $$SERVER_URL/api/v1\033[0m"; \
	cd dashboard && npm run dev

.PHONY: dev-docs
dev-docs: ## Start docs only (Astro)
	cd docs && npm run dev

.PHONY: dev-sdk
dev-sdk: ## Start SDK in watch mode (tsup)
	cd sdk && npm run dev

## —— Database ——————————————————————————————————————

.PHONY: db
db: ## Start PostgreSQL via Docker Compose (server/compose.yaml)
	@cd server && docker compose up -d database
	@echo "\033[32m✓ PostgreSQL ready (auto-detected by Symfony CLI)\033[0m"

.PHONY: db-stop
db-stop: ## Stop PostgreSQL
	cd server && docker compose stop database

.PHONY: db-migrate
db-migrate: ## Run database migrations
	cd server && symfony console doctrine:migrations:migrate --no-interaction

.PHONY: db-diff
db-diff: ## Generate a new migration from entity changes
	cd server && symfony console doctrine:migrations:diff

.PHONY: db-reset
db-reset: ## Reset database (drop + create + migrate)
	cd server && symfony console doctrine:database:drop --force --if-exists
	cd server && symfony console doctrine:database:create
	cd server && symfony console doctrine:migrations:migrate --no-interaction
	@echo "\033[32m✓ Database reset complete.\033[0m"

.PHONY: create-user
create-user: ## Create a user (email=… password=… name=… admin=1)
	cd server && symfony console oopsie:create-user $(email) $(password) \
		$(if $(name),--name="$(name)") \
		$(if $(admin),--admin)

## —— Build —————————————————————————————————————————

.PHONY: build
build: build-sdk build-dashboard build-docs ## Build all projects
	@echo "\033[32m✓ All builds complete.\033[0m"

.PHONY: build-server
build-server: ## Check Symfony container compilation
	cd server && symfony console lint:container

.PHONY: build-dashboard
build-dashboard: ## Build dashboard for production
	cd dashboard && npm run build

.PHONY: build-docs
build-docs: ## Build documentation site
	cd docs && npm run build

.PHONY: build-sdk
build-sdk: ## Build SDK (ESM + CJS + IIFE)
	cd sdk && npm run build

## —— Test ——————————————————————————————————————————

.PHONY: test
test: test-server test-sdk ## Run all tests
	@echo "\033[32m✓ All tests passed.\033[0m"

.PHONY: test-server
test-server: ## Run server tests (PHPUnit)
	cd server && symfony php bin/phpunit

.PHONY: test-sdk
test-sdk: ## Run SDK tests (Vitest)
	cd sdk && npm test

## —— Docker (production) ———————————————————————————

.PHONY: up
up: ## Start all services via Docker Compose (production-like)
	docker compose up -d

.PHONY: down
down: ## Stop all Docker Compose services
	docker compose down

.PHONY: logs
logs: ## Tail Docker Compose logs
	docker compose logs -f

## —— Stop / Clean ——————————————————————————————————

.PHONY: stop
stop: ## Stop all dev services
	-@cd server && symfony server:stop 2>/dev/null
	-@cd server && docker compose stop 2>/dev/null
	-@rm -f dashboard/.env.local
	@echo "\033[32m✓ All services stopped.\033[0m"

.PHONY: clean
clean: ## Clean all build artifacts
	rm -rf sdk/dist
	rm -rf dashboard/.next dashboard/out
	rm -rf docs/dist
	rm -rf server/var/cache server/var/log
	@echo "\033[32m✓ Clean complete.\033[0m"

## —— Help ——————————————————————————————————————————

.PHONY: help
help: ## Show this help
	@echo ""
	@echo "  \033[1mOopsie — Available commands\033[0m"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36mmake %-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
