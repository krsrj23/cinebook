# CineBook — Frontend

A React + Vite frontend for CineBook, a movie/event ticket booking app. It talks to a
Spring Boot backend over a REST API described in `API_CONTRACT.md`.

## Tech stack

- React 18 (JavaScript, Vite)
- React Router v6
- Axios
- Tailwind CSS

## Prerequisites

- Node.js 18 or newer
- The CineBook backend running (default: `http://localhost:8080/api`)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default (Vite's default dev port), which the
backend already allows via CORS.

## Configuring the API base URL

By default the frontend calls the backend at `http://localhost:8080/api`. If your backend
runs somewhere else, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Restart `npm run dev` after changing `.env`.

## Demo accounts

The backend seeds these accounts on first startup, so you can explore the app right away
without registering:

| Role     | Email               | Password   | Use it to…                                                 |
| -------- | ------------------- | ---------- | ------------------------------------------------------------ |
| Admin    | admin@cinebook.dev  | Admin@123  | Manage movies, venues/halls, shows, and view all bookings   |
| Customer | demo@cinebook.dev   | Demo@123   | Browse movies, book seats, view "My Bookings"                |

The login page also has one-click buttons to fill in either set of credentials.

## Available scripts

- `npm run dev` — start the Vite dev server with hot reload
- `npm run build` — production build, output to `dist/`
- `npm run preview` — preview the production build locally

## Project structure

```
src/
  api/          axios client + one thin module per resource (auth, movies, shows, bookings, admin)
  components/   reusable UI: Navbar, SeatMap, CountdownTimer, ProtectedRoute/AdminRoute, etc.
  context/      AuthContext (JWT + user, persisted in localStorage)
  pages/        route-level screens (Home, MovieDetail, SeatSelection, BookingConfirmation,
                MyBookings, Login, Register)
  pages/admin/  admin-only screens (Dashboard, ManageMovies, ManageVenues, ManageShows, AllBookings)
  utils/        formatting helpers (currency, dates, durations)
```

## Notes on the booking flow

1. Pick a movie → pick a showtime → select seats on the seat map.
2. "Hold Seats" calls `POST /bookings/hold`, which locks the seats for 5 minutes.
3. You're taken to a payment step with a live countdown; choose a mock payment method and
   confirm to complete the booking.
4. If the countdown runs out before you pay, the hold expires server-side and the seats
   become available again — the UI will tell you to pick seats again.
