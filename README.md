# CineBook — Movie & Event Ticket Booking App

A full-stack ticket booking app built as a portfolio project: Spring Boot (Java) +
MySQL backend, React + Tailwind frontend. The centerpiece is a concurrency-safe
seat-holding flow that stops two customers from booking the same seat.

```
booking-app/
├── API_CONTRACT.md   ← the spec both halves were built against (routes, DTOs, schema)
├── backend/           Spring Boot 3 / Java 17 / MySQL / Spring Security (JWT)
└── frontend/          React 18 / Vite / Tailwind / React Router
```

## Quick start

1. **Backend** — see `backend/README.md`. Short version: create a MySQL database
   called `cinebook`, set your username/password in
   `backend/src/main/resources/application.properties`, then:
   ```
   cd backend
   mvn spring-boot:run
   ```
   It seeds demo data on first run (movies, venues, halls, shows, and two
   logins) so there's something to look at immediately.

2. **Frontend** — see `frontend/README.md`. Short version:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Then open the printed `localhost:5173` URL.

3. **Log in** with one of the seeded accounts:
   - Admin: `admin@cinebook.dev` / `Admin@123` — manage movies, venues, halls, shows, view all bookings
   - Customer: `demo@cinebook.dev` / `Demo@123` — browse, pick seats, book

## What to read first if you're learning from this code

- `API_CONTRACT.md` — the whole schema and API surface in one place.
- `backend/src/main/java/com/cinebook/service/BookingService.java` — the seat
  hold → confirm → cancel flow, and the `@Lock(PESSIMISTIC_WRITE)` query in
  `ShowSeatRepository` it relies on. This is the part worth being able to
  explain in an interview: what happens when two people click the same seat
  at the same time.
- `backend/src/main/java/com/cinebook/service/HoldExpiryService.java` — the
  scheduled job that releases seats nobody paid for.
- `frontend/src/components/SeatMap.jsx` — the seat-grid UI and the countdown
  once a hold exists.

## Notes on this build

- The backend was written and manually reviewed for correctness, but could
  not be compiled inside this sandbox (no network access to Maven Central
  from here) — run `mvn -DskipTests compile` yourself first thing after
  cloning, before you start changing things, so you're working from a known
  green baseline.
- The frontend **was** built and verified (`npm run build` succeeds).
- Payment is mocked (no real payment gateway) — `confirm` always succeeds
  once you provide a payment method, which is enough to demonstrate the
  booking lifecycle without needing real payment credentials.
