# Part 5 — Bloglist frontend

The Part 5 React client is in `bloglist-frontend/` and uses the Part 4 API in `../part4/blog-backend/`.

## Implemented exercises

- **5.1–5.4:** sign-in, authenticated views, persistent session, sign-out, create-note flow, and success/error notifications.
- **5.5–5.6:** show/hide note form, cancel behavior, and extracted form component with its own state.
- **5.7:** blog details toggle.
- **5.8–5.10:** like updates, creator retention, and descending likes order.
- **5.11:** owner-only delete action with confirmation.
- **5.12:** notifications fade away after a short delay.
- **5.13–5.16:** Vitest component tests for collapsed details, revealed details, repeated likes, and form submission.
- **5.17–5.23, 5.28:** Playwright end-to-end coverage for sign-in, failed sign-in, create, like, and owner deletion. E2E runs use a temporary in-memory database.
- **5.24–5.27:** React Router views for the reading room, login, reader list, reader profile, blog detail, and create note; authenticated-only likes and role-aware detail actions.
- **5.29–5.31:** styled-components polish for forms, navigation, notifications, and the blog detail view.

## Run locally

1. Start the Part 4 API with its MongoDB connection and secret configured.
2. In `bloglist-frontend/`, run `npm install` and `npm run dev`.
3. Run the frontend checks with `npm test`, `npm run lint`, and `npm run build`.
4. Run browser tests with `npm run test:e2e` (Chromium required). The E2E server starts a temporary MongoDB instance and exposes a reset route only in test mode.

The Part 4 login response also includes the authenticated user's public ID so the client can enforce the creator-only delete control.
