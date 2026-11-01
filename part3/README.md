# Full Stack Open — Part 3

The Part 3 phonebook is split into a React/Vite UI and an Express/Mongoose API.

## Local development

1. In `phonebook-backend`, copy `.env.example` to `.env` and set `MONGODB_URI` to a private MongoDB connection string. Keep `.env` untracked.
2. Run `npm run dev` in `phonebook-backend`.
3. Run `npm run dev` in `phonebook-frontend` in another terminal. Vite proxies `/api` to port 3001.

The backend starts with sample in-memory entries if no database URL is configured, so the API exercises can be explored without credentials. Database-backed changes require MongoDB.

## Production UI build

Run `npm run deploy:ui` in `phonebook-backend`. It builds the frontend and copies it into the backend's `dist` folder; Express serves the UI and API from the same origin.

## Exercise mapping

- 3.1–3.8: Express API, middleware, logging, info endpoint, CRUD and error handling.
- 3.9–3.11: frontend-to-backend integration, production build and deployment preparation.
- 3.12: `mongo.js` supports adding/listing contacts from the command line.
- 3.13–3.18: MongoDB model and database-backed CRUD/error handling.
- 3.19–3.20: schema validation for names and phone numbers.
- 3.21: full-stack production build and backend hosting; production hosting still requires a database and hosting account.
- 3.22: ESLint setup and style rules in `eslint.config.mjs`.

AI assistance was used to implement and review these exercises; the learner should review and understand the submitted code.
