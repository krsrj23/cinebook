# CineBook — API Contract & Schema (source of truth)

Movie/event ticket booking app. Backend: Spring Boot 3 + Java 17 + MySQL + Spring
Security (JWT). Frontend: React 18 + Vite + Tailwind + React Router v6 + Axios.

Base URL (dev): `http://localhost:8080/api`
Frontend dev server: `http://localhost:5173` (Vite default) — backend must allow
this origin via CORS.

## Entities (Java field names, camelCase; JPA default naming strategy converts to snake_case columns)

- **User**: id, name, email (unique), password (hashed, bcrypt), phone, role (enum: `ADMIN`, `CUSTOMER`), createdAt
- **Movie**: id, title, description, genre, language, durationMinutes (int), posterUrl, releaseDate (LocalDate)
- **Venue**: id, name, city, address
- **Hall**: id, venue (FK), name, rows (int), seatsPerRow (int), premiumRows (int — how many front rows, counted from row A, are PREMIUM; rest are REGULAR)
- **Seat**: id, hall (FK), seatRow (char/string, e.g. "A"), seatNumber (string, e.g. "A1"), seatType (enum: `REGULAR`, `PREMIUM`)
- **Show**: id, movie (FK), hall (FK), showDateTime (LocalDateTime), basePrice (BigDecimal) — PREMIUM seats price = basePrice * 1.5
- **ShowSeat**: id, show (FK), seat (FK), status (enum: `AVAILABLE`, `HELD`, `BOOKED`), holdExpiresAt (LocalDateTime, nullable), version (int, `@Version`) — **unique constraint (show_id, seat_id)**. This is the row that answers "is this seat taken for this show" — it is generated once per seat when a Show is created.
- **Booking**: id, user (FK), show (FK), totalAmount (BigDecimal), status (enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`), bookingTime (LocalDateTime)
- **BookingSeat**: id, booking (FK), showSeat (FK, **unique** — a ShowSeat can belong to at most one active BookingSeat)
- **Payment**: id, booking (FK, unique), amount, status (enum: `SUCCESS`, `FAILED`), transactionId (string, generated), method (string, e.g. "CARD"/"UPI" — mock only, no real gateway), paidAt

## The core mechanism (must be implemented correctly, this is the point of the project)

1. `POST /api/bookings/hold` — inside a single `@Transactional` method, lock the
   requested `ShowSeat` rows with `@Lock(LockModeType.PESSIMISTIC_WRITE)` (a
   `SELECT ... FOR UPDATE`-backed repository method), verify every one is
   `AVAILABLE`, flip them to `HELD` with `holdExpiresAt = now + 5 minutes`,
   create a `Booking` (`PENDING`) + `BookingSeat` rows. If any requested seat is
   not `AVAILABLE` when locked, reject the whole request (409) — no partial holds.
2. A `@Scheduled` job runs every 30s: finds `ShowSeat`s with `status = HELD` and
   `holdExpiresAt < now`, flips them back to `AVAILABLE` (clear holdExpiresAt),
   and marks their parent `Booking` `EXPIRED` if it was still `PENDING`.
3. `POST /api/bookings/{id}/confirm` — simulates payment (always succeeds unless
   told otherwise; add a tiny random-fail chance is optional, keep it simple:
   always succeed), creates a `Payment` row, flips the `Booking` to `CONFIRMED`
   and its `ShowSeat`s to `BOOKED`. Fails with 409 if the booking already expired.
4. `POST /api/bookings/{id}/cancel` — customer can cancel a `PENDING` or
   `CONFIRMED` booking; releases its `ShowSeat`s back to `AVAILABLE`.

## REST endpoints

### Auth (public)
- `POST /api/auth/register` — body `{name, email, password, phone}` → 201
  `{id, name, email, role}`
- `POST /api/auth/login` — body `{email, password}` → 200
  `{token, id, name, email, role}` (JWT in `token`, role is `ADMIN`|`CUSTOMER`)

All authenticated requests send `Authorization: Bearer <token>`.

### Movies & shows (public read)
- `GET /api/movies` → `[{id, title, description, genre, language, durationMinutes, posterUrl, releaseDate}]`
- `GET /api/movies/{id}` → single movie
- `GET /api/movies/{id}/shows` → `[{id, showDateTime, basePrice, venueName, city, hallName, availableSeats, totalSeats}]`
- `GET /api/shows/{id}` → `{id, movieTitle, venueName, city, hallName, showDateTime, basePrice}`
- `GET /api/shows/{id}/seats` → `{holdSeconds: 300, seats: [{showSeatId, seatId, seatRow, seatNumber, seatType, price, status}]}` grouped/sortable by row on the frontend

### Booking (auth required, role CUSTOMER or ADMIN)
- `POST /api/bookings/hold` — body `{showId, showSeatIds: [1,2,3]}` → 201
  `{bookingId, expiresAt, totalAmount, seats: [{showSeatId, seatNumber, price}]}`, 409 if any seat unavailable
- `POST /api/bookings/{id}/confirm` — body `{paymentMethod}` → 200
  `{bookingId, status, transactionId, paidAmount}`
- `POST /api/bookings/{id}/cancel` → 200 `{bookingId, status}`
- `GET /api/bookings/my` → `[{id, movieTitle, posterUrl, venueName, hallName, showDateTime, seatNumbers: [...], totalAmount, status, bookingTime}]`
- `GET /api/bookings/{id}` → single booking, same shape as above

### Admin (auth required, role ADMIN)
- `GET/POST/PUT/DELETE /api/admin/movies` / `/api/admin/movies/{id}`
- `GET/POST/PUT/DELETE /api/admin/venues` / `/api/admin/venues/{id}`
- `POST /api/admin/venues/{venueId}/halls` — body `{name, rows, seatsPerRow, premiumRows}` → auto-generates all `Seat` rows for the hall; `GET/PUT/DELETE /api/admin/halls/{id}`
- `GET/POST/PUT/DELETE /api/admin/shows` / `/api/admin/shows/{id}` — creating a show auto-generates one `ShowSeat` (status `AVAILABLE`) per `Seat` in the hall
- `GET /api/admin/bookings` → all bookings, same shape as customer booking DTO plus `customerName`, `customerEmail`
- `GET /api/admin/dashboard` → `{totalMovies, totalShows, totalBookings, totalRevenue}` (simple aggregate counts, for an admin landing page)

### Error shape (all 4xx/5xx)
`{timestamp, status, error, message, path}`

## Seed data (backend seeds on startup if DB is empty)
- Admin user: `admin@cinebook.dev` / `Admin@123`
- One demo customer: `demo@cinebook.dev` / `Demo@123`
- 2 venues, 2 halls each (rows=8, seatsPerRow=10, premiumRows=2)
- 4–5 movies with realistic titles/genres
- Several shows across today and the next few days so the app is immediately explorable

## Config
- Backend reads MySQL connection from `application.properties` (`cinebook` schema,
  `spring.jpa.hibernate.ddl-auto=update`), JWT secret + expiry (24h) as properties.
- CORS: allow `http://localhost:5173` with credentials for `Authorization` header.
