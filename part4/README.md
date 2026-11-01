# Full Stack Open — Part 4

Bloglist REST API built with Express 5 and Mongoose. It includes blog CRUD, helper functions and unit tests, API integration tests, user registration, password hashing, JWT login, and creator-based authorization.

## Run locally

1. In `blog-backend`, copy `.env.example` to `.env` and set `MONGODB_URI` and `SECRET`.
2. Run `npm install`.
3. Run `npm run dev` to start the API at `http://localhost:3003`.
4. Run `npm test` for the helper and API test suites. API tests use MongoDB Memory Server and do not modify the configured Atlas database.

## API routes

- `GET /api/blogs` and `GET /api/blogs/:id`: public blog listing and details.
- `POST /api/blogs`: create a blog with a Bearer token.
- `PUT /api/blogs/:id`: update a blog.
- `DELETE /api/blogs/:id`: delete only as the blog's creator.
- `GET /api/users` and `POST /api/users`: list users and create accounts.
- `POST /api/login`: verify credentials and issue a JWT.

## Exercise coverage

- 4.1–4.2: Bloglist API and modular Express/Mongoose structure.
- 4.3–4.7: Dummy, total likes, favorite blog, most blogs, most likes, and unit tests.
- 4.8–4.12: SuperTest API tests, `id` serialization, create/default likes/required fields.
- 4.13–4.14: Blog deletion and update endpoints with API coverage.
- 4.15–4.16: User creation, bcryptjs password hashes, validation, unique usernames, and tests.
- 4.17: Blog/user references and populated API responses.
- 4.18–4.20: Login tokens, authenticated blog creation, token extraction middleware.
- 4.21–4.23: Creator-only deletion, user extraction middleware, and authentication tests.
