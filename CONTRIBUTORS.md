# Project Contributors and Suggested Responsibilities

This file documents a suggested split of contributions for a three-person team working on this Event Management System. It also includes a template you can copy into your project README or use to record each member's actual contributions.

If you want, paste the real names for Member-1 / Member-2 / Member-3 and I will update this file with a polished, final list and a suggested git sign-off message for each change.

---

## Quick summary (recommended split)

- Member-1 — Backend & API (Node.js, Express, Mongoose)
  - Implement and maintain `server.js`, MongoDB models (`User`, `Event`), authentication, registration/login, admin endpoints, ticketing flows, and points system.
  - Ensure robust error handling, environment configuration (`PORT`, `MONGODB_URI`), and production readiness (CORS, body parsing, logging).

- Member-2 — Frontend UI & UX (HTML, CSS, Vanilla JS)
  - Work on the calendar UI (`calendar.html`, `calendar.css`, `calendar.js`), events listing pages, favorites, pinned events, and header/search interactions.
  - Implement responsive design, accessibility improvements, and visual polish (themes, dark mode, animations).

- Member-3 — Integration, QA, Docs & DevOps
  - Improve static file serving, integrate FullCalendar/third-party libs, write end-to-end and integration tests, and prepare local dev tooling (README, run scripts, optional docker-compose).
  - Maintain documentation (`ADMIN_GUIDE.md`, `ADMIN_SETUP.md`), create developer onboarding notes, and run/monitor the server locally for reproducing bugs.

---

## Suggested tasks by area (concrete items)

Backend (Member-1)
- Add unit tests for key API endpoints (events, register, login).
- Harden auth flows (rate limiting, input validation, stricter password rules).
- Extract models into `models/` and routes into `routes/` for modularity.
- Add environment-based logging (dev vs prod) and /health endpoint.

Frontend (Member-2)
- Finish calendar layout fixes and remove debug helpers after verification.
- Improve UI components: event cards, modal details, filter controls.
- Add lightweight client-side caching and offline-friendly behavior for events.

Integration / QA / Docs / DevOps (Member-3)
- Create `README.md` with setup steps (MongoDB, npm install, npm start).
- Add `docker-compose.yml` for local MongoDB + app, if desired.
- Create a simple end-to-end smoke test (e.g., Puppeteer or Playwright) that loads `calendar.html` and verifies the calendar renders.
- Coordinate code reviews and merge strategy (feature branches + PR reviews).

---

## Files you may want to claim (examples found in this repo)
- Backend: `server.js`, `package.json`
- Calendar & UI: `calendar.html`, `calendar.css`, `calendar.js`
- Favorites & header: `favorites.html`, `favorites.js`, `header-search.js`, `index.html`, `script.js`
- Styles & themes: `styles.css`, `dark-mode.css`, `event-management.css`
- Docs / guides: `ADMIN_GUIDE.md`, `ADMIN_SETUP.md`, `README.md` (create)

---

## Contribution log template (use in PR descriptions)

Title: <Short summary of the change>

Description:
- What I changed
- Why I changed it
- Files modified

How to test:
- Steps to reproduce locally
- What to look for

Signed-off-by: <Member Name> <email>

---

## Quick git workflow recommendation

1. Each feature/bugfix gets its own branch: `feature/<short-name>` or `fix/<short-name>`.
2. Open a pull request and assign one reviewer from the other two team members.
3. Use the Contribution log template above in the PR description.
4. Merge only after at least one approving review and CI checks (lint/tests) pass.

---

If you give me the three team member names and a short bullet list of what each has already done, I will generate a clean `CONTRIBUTORS.md` with per-person bullets and a `git` sign-off suggestion for each of the files they changed. I can also create a `README.md` with a short "Who did what" section and exact setup commands for local development.

