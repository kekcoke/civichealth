# =============================================================================
# CivicHealth Unified Portal — Local Development Makefile
# =============================================================================
# Usage:
#   make              → show this help
#   make install      → install all dependencies across the monorepo
#   make dev          → start all services (full stack)
#   make dev-civic    → start civic services only (portal-shell + lgu-civic + civic-api)
#   make dev-health   → start health services only (ha-clinical + ha-bff)
#   make storybook    → start shared-ui Storybook
#
# Prerequisites: Node 20+, .NET 10 SDK, Ruby 3.2+, Docker (for ha-bff SQL Server)
# =============================================================================

.PHONY: help install install-node install-ruby install-dotnet \
        dev dev-shell dev-lgu dev-clinical dev-bff dev-civic dev-health \
        storybook \
        build build-civic build-health \
        migrate migrate-civic migrate-health migrate-rollback \
        test test-civic-api test-ha-bff test-frontend \
        lint lint-fix \
        clean clean-dist clean-deps \
        db-up db-down

# ── Default target ─────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  CivicHealth Unified Portal — Dev Commands"
	@echo "  =========================================="
	@echo ""
	@echo "  Setup"
	@echo "    make install          Install ALL dependencies (Node + Ruby + .NET)"
	@echo "    make install-node     npm ci for the Nx monorepo"
	@echo "    make install-ruby     bundle install for ha-bff"
	@echo "    make install-dotnet   dotnet restore for civic-api"
	@echo "    make db-up            Start SQL Server (Docker) for ha-bff"
	@echo "    make db-down          Stop SQL Server container"
	@echo ""
	@echo "  Development (full stack)"
	@echo "    make dev              All services in parallel (tmux required)"
	@echo "    make dev-civic        portal-shell + lgu-civic + civic-api"
	@echo "    make dev-health       ha-clinical + ha-bff"
	@echo ""
	@echo "  Individual services"
	@echo "    make dev-shell        Angular portal-shell  :4200"
	@echo "    make dev-lgu          React lgu-civic       :4201"
	@echo "    make dev-clinical     Angular ha-clinical   :4202"
	@echo "    make dev-bff          Ruby ha-bff           :4300"
	@echo "    make storybook        Storybook shared-ui   :6006"
	@echo ""
	@echo "  Database"
	@echo "    make migrate          Run ALL pending migrations"
	@echo "    make migrate-civic    Run EF Core migrations (civic-api PostgreSQL)"
	@echo "    make migrate-health   Run ActiveRecord migrations (ha-bff SQL Server)"
	@echo "    make migrate-rollback Roll back last ha-bff migration"
	@echo ""
	@echo "  Build"
	@echo "    make build            Production build for all apps (Nx affected)"
	@echo "    make build-civic      Build portal-shell + lgu-civic"
	@echo "    make build-health     Build ha-clinical"
	@echo ""
	@echo "  Test & Lint"
	@echo "    make test             Run all tests"
	@echo "    make test-civic-api   dotnet test civic-api"
	@echo "    make test-ha-bff      bundle exec rspec ha-bff"
	@echo "    make test-frontend    nx run-many --target=test"
	@echo "    make lint             ESLint + dotnet format check + rubocop"
	@echo "    make lint-fix         Auto-fix lint issues"
	@echo ""
	@echo "  Cleanup"
	@echo "    make clean            Remove build artifacts"
	@echo "    make clean-dist       Remove dist/ folders"
	@echo "    make clean-deps       Remove node_modules + vendor"
	@echo ""

# ── Install ────────────────────────────────────────────────────────────────
install: install-node install-ruby install-dotnet
	@echo "✅  All dependencies installed."

install-node:
	@echo "→ Installing Node dependencies..."
	cd apps/portal-shell && npm ci || npm install
	cd apps/lgu-civic && npm ci || npm install
	cd apps/ha-clinical && npm ci || npm install
	cd libs/shared-ui && npm ci || npm install

install-ruby:
	@echo "→ Installing Ruby dependencies (ha-bff)..."
	bash -c 'source ~/.rvm/scripts/rvm && rvm use 3.2.11 && cd apps/ha-bff && bundle install'

install-dotnet:
	@echo "→ Restoring .NET packages (civic-api)..."
	dotnet restore apps/civic-api/CivicApi/CivicApi.csproj

# ── Database (Docker) ──────────────────────────────────────────────────────
db-up:
	@echo "→ Starting SQL Server 2022 for ha-bff..."
	docker run -d --name civichealth-sqlserver \
	  -e ACCEPT_EULA=Y \
	  -e SA_PASSWORD=CivicHealth_Dev2026! \
	  -p 1433:1433 \
	  mcr.microsoft.com/mssql/server:2022-latest
	@echo "⏳  Waiting 15s for SQL Server to initialize..."
	sleep 15
	@echo "✅  SQL Server running on localhost:1433"

db-down:
	docker stop civichealth-sqlserver && docker rm civichealth-sqlserver

# ── Individual service dev servers ─────────────────────────────────────────
dev-shell:
	npx nx serve portal-shell --port=4200

dev-lgu:
	cd apps/lgu-civic && npx webpack serve --mode development

dev-clinical:
	npx nx serve ha-clinical --port=4202

dev-bff:
	cd apps/ha-bff && bundle exec ruby app.rb -p 4300

storybook:
	cd libs/shared-ui && npm run storybook

# ── Combined dev (requires tmux) ───────────────────────────────────────────
dev:
	@command -v tmux >/dev/null 2>&1 || { echo "tmux is required for 'make dev'. Install with: brew install tmux"; exit 1; }
	tmux new-session -d -s civichealth -n shell   'make dev-shell'
	tmux new-window  -t civichealth -n lgu-civic  'make dev-lgu'
	tmux new-window  -t civichealth -n ha-clinical 'make dev-clinical'
	tmux new-window  -t civichealth -n ha-bff      'make dev-bff'
	tmux new-window  -t civichealth -n dotnet      'cd apps/civic-api && dotnet watch run'
	@echo ""
	@echo "✅  All services started in tmux session 'civichealth'"
	@echo "    Attach with:  tmux attach -t civichealth"
	@echo "    Switch panes: Ctrl+B then window number (0-4)"
	@echo ""
	@echo "    portal-shell  → http://localhost:4200"
	@echo "    lgu-civic     → http://localhost:4201"
	@echo "    ha-clinical   → http://localhost:4202"
	@echo "    ha-bff        → http://localhost:4300"
	@echo "    civic-api     → http://localhost:5000"

dev-civic:
	@command -v tmux >/dev/null 2>&1 || { echo "tmux required"; exit 1; }
	tmux new-session -d -s civic -n shell    'make dev-shell'
	tmux new-window  -t civic -n lgu-civic   'make dev-lgu'
	tmux new-window  -t civic -n civic-api   'cd apps/civic-api && dotnet watch run'
	@echo "✅  Civic stack started. Attach: tmux attach -t civic"

dev-health:
	@command -v tmux >/dev/null 2>&1 || { echo "tmux required"; exit 1; }
	tmux new-session -d -s health -n clinical  'make dev-clinical'
	tmux new-window  -t health -n ha-bff       'make dev-bff'
	@echo "✅  Health stack started. Attach: tmux attach -t health"

# ── Database migrations ────────────────────────────────────────────────────
migrate: migrate-civic migrate-health
	@echo "✅  All migrations applied."

migrate-civic:
	@echo "→ Running EF Core migrations (civic-api → PostgreSQL)..."
	cd apps/civic-api && dotnet ef database update

migrate-health:
	@echo "→ Running ActiveRecord migrations (ha-bff → SQL Server)..."
	cd apps/ha-bff && bundle exec rake db:migrate

migrate-rollback:
	@echo "→ Rolling back last ha-bff migration..."
	cd apps/ha-bff && bundle exec rake db:rollback

migrate-status:
	@echo "=== Civic API (EF Core) migration status ==="
	cd apps/civic-api && dotnet ef migrations list
	@echo ""
	@echo "=== HA BFF (ActiveRecord) migration status ==="
	cd apps/ha-bff && bundle exec rake db:migrate:status

# ── Build ──────────────────────────────────────────────────────────────────
build:
	npx nx run-many --target=build --all --configuration=production

build-civic:
	npx nx run-many --target=build --projects=portal-shell,lgu-civic --configuration=production

build-health:
	npx nx build ha-clinical --configuration=production

# ── Test ───────────────────────────────────────────────────────────────────
test: test-civic-api test-ha-bff test-frontend
	@echo "✅  All tests complete."

test-civic-api:
	dotnet test apps/civic-api/CivicApi.csproj --verbosity normal

test-ha-bff:
	cd apps/ha-bff && bundle exec rspec

test-frontend:
	npx nx run-many --target=test --all --browsers=ChromeHeadless

# ── Lint ───────────────────────────────────────────────────────────────────
lint:
	npx nx run-many --target=lint --all
	dotnet format apps/civic-api/CivicApi.csproj --verify-no-changes
	cd apps/ha-bff && bundle exec rubocop

lint-fix:
	npx nx run-many --target=lint --all --fix
	dotnet format apps/civic-api/CivicApi.csproj
	cd apps/ha-bff && bundle exec rubocop -a

# ── Cleanup ────────────────────────────────────────────────────────────────
clean: clean-dist
	@echo "✅  Build artifacts removed."

clean-dist:
	rm -rf dist/ apps/civic-api/bin/ apps/civic-api/obj/ \
	       apps/ha-bff/tmp/ libs/shared-ui/storybook-static/

clean-deps:
	rm -rf node_modules/ libs/shared-ui/node_modules/ apps/ha-bff/vendor/bundle/
	@echo "⚠️  Run 'make install' to reinstall dependencies."
