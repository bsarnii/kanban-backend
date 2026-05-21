# Kanban Backend

REST API backend for the Kanban Task Manager application built with [NestJS](https://nestjs.com/), TypeORM, and MySQL.

## Tech Stack

- **Framework:** NestJS
- **Database:** MySQL (TypeORM)
- **Authentication:** JWT + Passport (Local strategy)
- **Password Hashing:** Argon2
- **Email:** Nodemailer (Zoho SMTP) with Handlebars templates
- **Security:** Helmet, CORS, rate limiting via @nestjs/throttler
- **Validation:** class-validator + class-transformer

## Prerequisites

- Node.js
- MySQL database
- SMTP credentials (Zoho Mail or similar)

## Setup

```bash
npm install
```

## Running the App

```bash
# development (watch mode)
npm run start:dev

# production
npm run start:prod
```

The server starts on port 3000 by default (configurable via `PORT`).

## Database

```bash
# run migrations
npm run migration:run:dev

# generate a migration
npm run migration:generate:dev -- db/migrations/MigrationName

# seed development data
npm run seed:dev
```

The dev seed creates a test user (`test@mykanbanapp.com` / `testmykanbanapp`) with a sample board.

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Project Structure

```text
src/
├── auth/           # Authentication (JWT, guards, strategies)
├── config/         # Database & throttler configuration
├── database/       # TypeORM datasource
├── mail/           # Email service & templates
├── task-management/
│   ├── boards/         # Board CRUD
│   ├── tasks/          # Task CRUD + subtasks + statuses
│   ├── board-member/   # Board member management
│   ├── guards/         # Role-based access guards
│   └── types/          # Shared types & enums
└── users/          # User registration & verification
```

## Security

- All routes are JWT-protected by default (opt-out with `@Public()` decorator)
- Rate limiting on auth and user endpoints (10 requests / 5 minutes)
- Email verification required before login
- Role-based access control on board operations (owner, editor, viewer)
