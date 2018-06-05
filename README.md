# nest-identity

## Description

Standard user management, roles, authentication, and ACL handling.

## Requirements

Make sure to have the following installed

* `NodeJS / NPM` for application
* `docker` for postgres database
* `tslint` for TypeScript linting (tslint in VSCode to automate linting)
* `jest` for unit testing

## Installation

```bash
$ npm install
```

## Database Setup

Setup the Postgres database instance.

```bash
$ docker-compose up
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration

* `jwt.expiresIn` (Environment: `JWT_EXPIRES_IN`) - expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).
* `jwt.secret` (Environment: `JWT_SECRET`) - is a string, buffer, or object containing either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA.
* `pagination.maxPageSize` - when querying a list of records limit the number of records returned (defaults to 200).
* `pagination.defaultPageSize` - when querying a list of records limit the number of records returned by default (defaults to 100).
* `password.rounds` - Number of bcrypt rounds to use, defaults to 10 if omitted.
