
# backend-whatsapp
Microservicio de whatsapp.
```bash
node version -> 16.15.0
```

## Installation

```bash
$ npm install
$ npx prisma generate
```
## Enviroments

```bash
# Local = Credenciales de Valhalla (.env.development)
# Dev = Credenciales de Valhalla  (.env.development)
# Prod = Credenciales de WorkSpace  (.env.production)
```

## Running the app

```bash
# development mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Linter

```bash
$ npm run lint

```

## Tables 

```bash
# all tables
created_at (timestamp)
updated_at (timestamp)
created_by (varchar 120) default(System)
updated_by (varchar 120)
status (int4) Fijo 0 Inactivo 1 Activo

# Group
id PK
name (varchar 50)
description (text)
tags jsonb (Array)

```
