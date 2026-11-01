# Full Stack Open · Part 2

Three small React applications covering exercises 2.1–2.20:

- `courseinfo`: reusable components, rendering collections, and `reduce` totals (2.1–2.5)
- `phonebook`: search, create, duplicate replacement, delete, server persistence, and notifications (2.6–2.17)
- `countries`: country search, selectable results, country details, flags, languages, and capital weather (2.18–2.20)

## Run

Each app has its own Vite development server. From its folder, run `npm run dev`.

For the phonebook, open a second terminal in `phonebook` and run `npm run server`; then run the frontend in the first terminal. The local API listens at `http://localhost:3001/persons` and persists contacts in `db.json`.

## Exercise notes

Country details come from the course's Helsinki REST Countries API. Exercise 2.20 uses Open-Meteo's geocoding and forecast services, so it does not require a private API key.

These solutions were developed with AI assistance and should be reviewed and understood by the student before submission.
