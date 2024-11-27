# Navi AI Selector

A web-based tool that enables users to interact with OpenAI and Anthropic AI models through a clean, simple interface.

## Prerequisites

-   Docker and Docker Compose
-   Make (optional, for using Makefile commands)

## Setup Instructions

1. Clone the repository:

```bash
# ssh
git clone git@github.com:AkBo24/navi-ai-selector.git
cd git@github.com:AkBo24/navi-ai-selector.git

# https
git clone https://github.com/AkBo24/navi-ai-selector.git
cd https://github.com/AkBo24/navi-ai-selector.git
```

2. Configure environment variables:

    - Navigate to the `./app` directory
    - Copy the example environment file:
        ```bash
        cp example.env .env
        ```
    - Open `.env` and add your API keys:
        ```
        OPENAI_API_KEY=your_openai_key_here
        ANTHROPIC_API_KEY=your_anthropic_key_here
        ```

3. Build and start the containers:

Using Make:

```bash
make up-build
```

Or using Docker Compose directly:

```bash
docker compose up -d --build
```

The application will be available at:

-   Frontend: http://localhost:3000
-   Backend API: http://localhost:8000

## Available Commands

The project includes a Makefile for common operations. Here are some useful commands:

```bash
make up          # Start containers
make down        # Stop containers
make restart     # Rebuild and restart containers
make clean       # Remove containers, volumes, and cleanup

# Viewing logs
make app-logs    # View backend logs
make frontend-logs # View frontend logs
make app-logs-f  # Stream backend logs
make frontend-logs-f # Stream frontend logs

# Access container shells
make app-shell   # Access backend container shell
make frontend-shell # Access frontend container shell
```

## Troubleshooting

### Windows-Specific Issues

-   If you're using WSL2, ensure Docker Desktop is configured to use the WSL2 backend
-   Use PowerShell or WSL2 terminal for running Docker commands
-   Line endings should be set to LF (not CRLF) for shell scripts

### Common Issues

-   If containers fail to start, check if ports 3000 or 8000 are already in use
-   Ensure all API keys are correctly set in the `.env` file
-   For permission issues, ensure Docker has the necessary permissions to access project directories

## Directory Structure

```
.
├── app/                # Backend (Django)
│   ├── example.env     # Example environment file
│   └── ...
├── frontend/          # Frontend (React)
├── docker-compose.yml
└── Makefile
```
