# Full Stack Open — Part 0: Fundamentals of Web apps

## Exercises 0.1–0.3

Reading-only refreshers completed: HTML, CSS, and HTML forms.

## 0.4: New note diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note over browser: User enters a note and clicks Save
    browser->>server: POST /new_note (form data: note content)
    activate server
    server->>server: Add note to in-memory notes array
    server-->>browser: 302 redirect, Location: /notes
    deactivate server

    browser->>server: GET /notes
    server-->>browser: HTML document
    browser->>server: GET /main.css
    server-->>browser: CSS file
    browser->>server: GET /main.js
    server-->>browser: JavaScript file
    browser->>server: GET /data.json
    server-->>browser: Updated notes as JSON
    Note right of browser: JavaScript renders the notes list in the DOM
```

## 0.5: Single page app diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note over browser: User navigates to the single-page Notes app
    browser->>server: GET /spa
    server-->>browser: HTML document
    browser->>server: GET /main.css
    server-->>browser: CSS file
    browser->>server: GET /spa.js
    server-->>browser: JavaScript file
    Note right of browser: Browser runs spa.js
    browser->>server: GET /data.json
    server-->>browser: Notes as JSON
    Note right of browser: JavaScript renders notes in the DOM
```

## 0.6: New note in Single page app diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note over browser: User enters a note and submits the SPA form
    browser->>browser: Prevent default form submission
    browser->>browser: Create note and update local state
    browser->>browser: Render the new note immediately
    browser->>server: POST /new_note_spa with JSON body
    Note right of browser: Content-Type is application/json
    activate server
    server->>server: Add note to in-memory notes array
    server-->>browser: 201 Created
    deactivate server
    Note over browser: Browser stays on this page with no reload
```
