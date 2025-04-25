<div align='center'>
  <img alt="LOGO" src="https://raw.githubusercontent.com/j-lewandowski/leftovers-frontend/7a48ac7a2861250818cf09144ea7342f327ee57d/src/assets/logo.svg" width=120/>
  <h1> Leftovers Backend</h1>
</div>

## Overview

This is the backend service for the Leftovers application, developed during my internship at [Moodup](https://moodup.team).

This repository contains the backend API service for the Leftovers platform. Built with NestJS and TypeScript, it provides a scalable and maintainable server-side solution with comprehensive API documentation, testing, and deployment pipelines.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **API Documentation**: Swagger
- **Email Templates**: MJML
- **File Storage**: AWS S3
- **Testing**: Jest
- **CI/CD**: CircleCI

## Getting Started

### Prerequisites

- Node.js (v22.11.0 recommended)
- Docker
- PostgreSQL
- AWS Account (for S3 file storage)
- SMTP Server (for email functionality)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/leftovers-backend.git
cd leftovers-backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .example.env .env
```

Edit the `.env` file with your specific configuration values.

4. Start the development server:

```bash
npm run start:dev
```

## Docker Setup

The project includes Docker configuration for containerized development and deployment:

### Using Docker for Development

1. Build the Docker image:

```bash
docker build -t leftovers-backend .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env leftovers-backend
```

### Docker Compose

For a complete development environment with database:

```bash
docker-compose up -d
```

This will start PostgreSQL database in containers.

## Environment Configuration

The application uses different environment files:

- `.env`: Main configuration for development
- `.env.test`: Configuration for testing environment

Required environment variables include:

- Database connection details
- JWT configuration
- Email service configuration
- AWS S3 credentials
- Frontend URL for cross-origin requests

## Available Scripts

- `npm run build`: Build the application
- `npm run start`: Run the application
- `npm run start:dev`: Run in development mode with hot reload
- `npm run start:debug`: Run in debug mode
- `npm run start:prod`: Run in production mode
- `npm run lint`: Run ESLint
- `npm test`: Run unit tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:cov`: Generate test coverage report

## API Documentation

The API documentation is automatically generated using Swagger and available at `/api` endpoint when the server is running. It includes detailed information about all endpoints, request/response schemas, and authentication methods.

## CI/CD Pipeline

The project uses CircleCI for continuous integration and deployment:

- **Lint**: Checks code quality
- **Unit Tests**: Validates functionality with unit tests
- **E2E Tests**: Ensures system works as expected with integration tests
- **Build**: Compiles the application for deployment

## Directory Structure

```
src/
├── app.module.ts             # Main application module
├── main.ts                   # Application entry point
├── email/                    # Email service and templates
│   └── templates/            # MJML email templates
└── [other modules]/          # Feature modules
```

## Features

- RESTful API endpoints
- JWT-based authentication
- Email notifications
- File uploads to AWS S3
- API documentation with Swagger
- CORS support
