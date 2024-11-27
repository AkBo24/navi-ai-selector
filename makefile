# Variables
DOCKER_COMPOSE = docker compose
APP_CONTAINER = app
FRONTEND_CONTAINER = frontend
PYTHON = $(DOCKER_COMPOSE) exec $(APP_CONTAINER) python
MANAGE_PY = $(PYTHON) /usr/src/app/manage.py

# Help
.PHONY: help
help:
	@echo "Makefile for Navi-ai project"
	@echo
	@echo "Available commands:"
	@echo "  make build                   Build the Docker containers"
	@echo "  make up                      Start the Docker containers"
	@echo "  make up-build                Build and Start the Docker containers"
	@echo "  make down                    Stop the Docker containers"
	@echo "  make restart                 Stop and rebuild the Docker containers"
	@echo "  make <app/frontend>-shell    Open a shell inside the app or frontend container"
	@echo "  make <app/frontend>-logs	  Print logs inside the app or frontend container"
	@echo "  make <app/frontend>-logs-f	  Stream logs inside the app  or frontendcontainer"
	@echo "  make migrate                 Apply migrations"
	@echo "  make makemigrations          Create new migrations"
	@echo "  make createsuperuser         Create a Django superuser"
	@echo "  make run                     Run the Django development server"
	@echo "  make collectstatic           Collect static files"
	@echo "  make test                    Run Django tests"
	@echo "  make clean                   Remove Docker containers, volumes, and Django's pyc files"

# Build and Run
build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d
up-build:
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build

app-shell:
	$(DOCKER_COMPOSE) exec $(APP_CONTAINER) /bin/bash #-c "cd usr/src/app && bash"

frontend-shell:
	$(DOCKER_COMPOSE) exec $(FRONTEND_CONTAINER) /bin/bash #-c "cd usr/src/app && bash"

app-logs:
	$(DOCKER_COMPOSE) logs $(APP_CONTAINER)

frontend-logs:
	$(DOCKER_COMPOSE) logs $(FRONTEND_CONTAINER)

app-logs-f:
	$(DOCKER_COMPOSE) logs -f $(APP_CONTAINER)

frontend-logs-f:
	$(DOCKER_COMPOSE) logs -f $(FRONTEND_CONTAINER)

# Django Tasks
makemigrations:
	$(MANAGE_PY) makemigrations

migrate:
	$(MANAGE_PY) migrate

createsuperuser:
	$(MANAGE_PY) createsuperuser

run:
	$(DOCKER_COMPOSE) exec $(APP_CONTAINER) /bin/bash
	#$(MANAGE_PY) runserver 0.0.0.0:8000

collectstatic:
	$(MANAGE_PY) collectstatic --noinput

test:
	$(MANAGE_PY) test

flush:
	$(MANAGE_PY) flush

# Clean Up
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
