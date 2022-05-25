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

## Responses

**Success**

```JSON
{
  "data": [],
  "success": true,
  "message": "successfully updated"
}
```

**Error**

```JSON
{
  "error": [],
  "success": false,
  "message": "error or missing token"
}
```

## Tables

**all tables**

| Parameter    | Type           | Default | Description             |
| :----------- | :------------- | :------ | :---------------------- |
| `created_at` | `timestamp`    |         | **Required**            |
| `updated_at` | `timestamp`    |         | **Required**            |
| `created_by` | `varchar(120)` |         | **Required**            |
| `updated_by` | `varchar(120)` |         | **Required**            |
| `status`     | `int(4)`       | 1       | (0 Inactivo) (1 Activo) |

**group**

| Parameter     | Type           | Default | Description      |
| :------------ | :------------- | :------ | :--------------- |
| `id`          | `serial`       |         | **Primary Key**. |
| `name`        | `varchar(50)`  |         | **Required**.    |
| `description` | `text`         |         |                  |
| `tags`        | `jsonb(array)` |         | **Required**.    |

**role**

| Parameter     | Type          | Default | Description      |
| :------------ | :------------ | :------ | :--------------- |
| `id`          | `serial`      |         | **Primary Key**. |
| `name`        | `varchar(50)` |         | **Required**.    |
| `description` | `text`        |         |                  |
| `config`      | `jsonb `      |         | **Required**.    |
