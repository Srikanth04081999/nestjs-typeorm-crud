# NestJS Assignment 4 — TypeORM CRUD with MySQL

## Project Description

This project integrates NestJS with MySQL using TypeORM.

Features:

- Repository-based user CRUD operations.
- User filtering by name.
- Post creation and title filtering using QueryBuilder.
- One-to-Many relationship between users and posts.
- DTO validation using a global ValidationPipe.
- Persistent storage in MySQL.

## Requirements

- Node.js and npm
- MySQL Server
- MySQL Workbench, optional
- Postman or Thunder Client for API testing

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/nestjs-typeorm-crud.git
cd nestjs-typeorm-crud
npm install --legacy-peer-deps
```

## Database Setup

Run in MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS nestjs_typeorm_crud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Create an application account and grant database access.
Replace the password placeholder before running:

```sql
CREATE USER IF NOT EXISTS 'nestjs_app'@'localhost'
IDENTIFIED BY 'YOUR_DATABASE_PASSWORD';

GRANT ALL PRIVILEGES
ON nestjs_typeorm_crud.*
TO 'nestjs_app'@'localhost';
```

If the account already exists, use ALTER USER to update its password.

## Environment Configuration

Create a `.env` file in the project root:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nestjs_app
DB_PASSWORD="YOUR_DATABASE_PASSWORD"
DB_DATABASE=nestjs_typeorm_crud
PORT=3000
```

The password must match the MySQL application account.

Do not commit `.env`. Include a `.env.example` file with placeholder values.

## Run the Application

Build:

```bash
npm run build
```

Start in development mode:

```bash
npm run start:dev
```

Base URL: http://localhost:3000

TypeORM creates the registered entity tables on startup when
`synchronize: true` is enabled.

Schema synchronization is used for local development only.
Production deployments should use migrations.

## API Testing URLs

Replace `1` with an existing user ID returned by POST /users.

| Method | URL | Purpose | Expected Status |
|---|---|---|---|
| GET | http://localhost:3000/ | Default application route | 200 |
| POST | http://localhost:3000/users | Create a user | 201 |
| GET | http://localhost:3000/users | List all users | 200 |
| GET | http://localhost:3000/users?name=raj | Filter users by name | 200 |
| GET | http://localhost:3000/users/1 | Get a user and their posts | 200 |
| PATCH | http://localhost:3000/users/1 | Update a user | 200 |
| DELETE | http://localhost:3000/users/1 | Delete a user and their posts | 200 |
| POST | http://localhost:3000/posts | Create a post | 201 |
| GET | http://localhost:3000/posts | List posts with their authors | 200 |
| GET | http://localhost:3000/posts?title=nestjs | Filter posts using QueryBuilder | 200 |

For POST and PATCH requests, select **Body → raw → JSON** and set:

```http
Content-Type: application/json
```

## Testing Steps

### 1. Create a User

Method: POST

URL: http://localhost:3000/users

Request body:

```json
{
  "name": "Raj",
  "email": "raj@example.com"
}
```

Expected status: 201 Created.

Example response:

```json
{
  "id": 1,
  "name": "Raj",
  "email": "raj@example.com"
}
```

Save the returned ID. Actual IDs may differ.

### 2. List All Users

Method: GET

URL: http://localhost:3000/users

Expected status: 200 OK.

### 3. Search Users by Name

Method: GET

URL: http://localhost:3000/users?name=raj

Expected status: 200 OK.

Returns users whose names contain `raj`. With the configured
case-insensitive collation, this also matches names such as `Raj Kumar`.

### 4. Get a User by ID

Method: GET

URL: http://localhost:3000/users/1

Expected status: 200 OK for an existing user.

The response includes the user's posts.

### 5. Update a User

Method: PATCH

URL: http://localhost:3000/users/1

Request body:

```json
{
  "name": "Raj Kumar"
}
```

Expected status: 200 OK.

You can also update the email:

```json
{
  "email": "raj.kumar@example.com"
}
```

### 6. Create a Post

Method: POST

URL: http://localhost:3000/posts

Request body:

```json
{
  "title": "Learning NestJS",
  "content": "Connecting NestJS with MySQL using TypeORM.",
  "userId": 1
}
```

Use an existing user ID.

Expected status: 201 Created.

### 7. Create Another Post

Method: POST

URL: http://localhost:3000/posts

Request body:

```json
{
  "title": "Learning MySQL",
  "content": "Understanding database tables and relationships.",
  "userId": 1
}
```

Expected status: 201 Created.

### 8. List All Posts

Method: GET

URL: http://localhost:3000/posts

Expected status: 200 OK.

The response includes each post's author.

### 9. Search Posts by Title

Method: GET

URL: http://localhost:3000/posts?title=nestjs

Expected status: 200 OK.

Returns posts whose titles contain `nestjs`.
This endpoint uses TypeORM QueryBuilder with a bound search parameter.

### 10. Verify the Relationship

Method: GET

URL: http://localhost:3000/users/1

The user's `posts` array should contain their created posts.

### 11. Verify Persistence

1. Stop Nest with Ctrl+C.
2. Restart using `npm run start:dev`.
3. Send GET http://localhost:3000/users.
4. Confirm the saved records still exist.

Data persists in MySQL after the application restarts.

### 12. Delete a User

Test deletion after capturing the required screenshots.

Method: DELETE

URL: http://localhost:3000/users/1

Expected status: 200 OK.

Example response:

```json
{
  "message": "User with ID 1 deleted successfully"
}
```

Deleting a user also deletes their posts because the relationship
uses `ON DELETE CASCADE`.

## Validation and Error Tests

| Method | URL | Test | Expected Status |
|---|---|---|---|
| POST | http://localhost:3000/users | Invalid email | 400 |
| POST | http://localhost:3000/users | Missing required fields | 400 |
| POST | http://localhost:3000/users | Duplicate email | 409 |
| GET | http://localhost:3000/users/999999 | User ID that does not exist | 404 |
| GET | http://localhost:3000/users/abc | Non-numeric ID | 400 |
| PATCH | http://localhost:3000/users/1 | Invalid email | 400 |
| POST | http://localhost:3000/posts | Missing title or content | 400 |
| POST | http://localhost:3000/posts | User ID that does not exist | 404 |

For the unknown-user tests, choose an ID that is absent from your database.

Invalid user example:

```json
{
  "name": "A",
  "email": "invalid-email"
}
```

Invalid post example:

```json
{
  "title": "",
  "content": "",
  "userId": 1
}
```

## Entity Relationship

- One User can have many Posts.
- Each Post belongs to one User.
- `users.email` has a unique constraint.
- `posts.userId` references `users.id`.
- Deleting a user cascades to their posts.

## Repository Operations

UsersService injects `Repository<User>` using `@InjectRepository(User)`.

Implemented methods:

- `createUser(dto)`
- `findAll(name?)`
- `getUserById(id)`
- `updateUser(id, dto)`
- `deleteUser(id)`

## MySQL Verification Queries

```sql
USE nestjs_typeorm_crud;

SHOW TABLES;

SELECT * FROM users;

SELECT * FROM posts;
```

View posts with their authors:

```sql
SELECT
    p.id AS post_id,
    p.title,
    u.name AS author,
    u.email
FROM posts AS p
INNER JOIN users AS u ON p.userId = u.id
ORDER BY p.id;
```

## Required Screenshots

Save actual screenshots in the `screenshots` folder.

### POST /users

![Create user](screenshots/post-user.png)

### GET /users?name=raj

![Filter users by name](screenshots/filter-users.png)

### GET /posts?title=nestjs

![Filter posts using QueryBuilder](screenshots/filter-posts.png)

## GitHub Repository

https://github.com/Srikanth04081999/nestjs-typeorm-crud
