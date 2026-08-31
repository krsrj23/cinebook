# CineBook Backend

Spring Boot 3 (Java 17) REST API for CineBook - a movie/event ticket booking
app. Implements JWT authentication, a concurrency-safe seat-holding flow
(pessimistic row locking + a scheduled expiry sweep), and admin CRUD for
movies, venues, halls and shows.

## Prerequisites

- **JDK 17** (or newer)
- **Maven 3.6+** (or use the included wrapper if you add one)
- **MySQL 8.x** running locally, listening on the default port `3306`

## 1. Create the database

Connect to MySQL and create the schema (the app will create the tables
itself via Hibernate on first run):

```sql
CREATE DATABASE cinebook;
```

You can also let the app create it automatically - the connection URL in
`application.properties` includes `createDatabaseIfNotExist=true` - but the
MySQL user you configure still needs privileges to create databases for that
to work. Creating it yourself with the SQL above is the safer bet.

## 2. Configure your credentials

Open `src/main/resources/application.properties` and replace the placeholder
username/password with your local MySQL credentials:

```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Everything else (schema name, port, JWT secret) is already set up for local
development.

## 3. Run the app

```bash
mvn spring-boot:run
```

The API starts on **http://localhost:8080**, with all endpoints under the
`/api` prefix. CORS is pre-configured to allow requests from the Vite dev
server at `http://localhost:5173`.

On first startup, `DataSeeder` populates the database with demo data
(movies, venues, halls, shows, and the two accounts below) - it only runs
once, when the `movies` table is empty, so it's safe to restart the app
without duplicating data.

## Seeded login credentials

| Role     | Email               | Password  |
|----------|---------------------|-----------|
| Admin    | admin@cinebook.dev  | Admin@123 |
| Customer | demo@cinebook.dev   | Demo@123  |

Log in with either through `POST /api/auth/login` to get a JWT, then send it
as `Authorization: Bearer <token>` on subsequent requests. The admin account
can additionally reach every `/api/admin/**` endpoint.

## Project layout

```
src/main/java/com/cinebook/
  entity/       JPA entities + enums (Role, SeatType, ShowSeatStatus, BookingStatus, PaymentStatus)
  repository/   Spring Data JPA repositories (ShowSeatRepository has the pessimistic-lock query)
  dto/          Request/response DTOs matching the API contract exactly
  service/      Business logic - AuthService, MovieService, ShowService,
                BookingService (the hold/confirm/cancel flow), AdminService,
                HoldExpiryService (the @Scheduled 30s sweep)
  controller/   REST controllers - Auth, Movie, Show, Booking, Admin
  security/     JwtUtil, JwtAuthFilter, UserDetailsServiceImpl, SecurityConfig
  exception/    GlobalExceptionHandler + custom exceptions
  config/       DataSeeder (CommandLineRunner)
```

## The core mechanism: seat holding

`POST /api/bookings/hold` is the heart of this project. Inside one
`@Transactional` method it:

1. Locks the requested `ShowSeat` rows with `SELECT ... FOR UPDATE`
   (`@Lock(LockModeType.PESSIMISTIC_WRITE)` in `ShowSeatRepository`).
2. Re-checks that every locked row is still `AVAILABLE`.
3. Only if *all* of them are available does it flip them to `HELD`
   (with a 5-minute `holdExpiresAt`) and create the `Booking` + `BookingSeat`
   rows. If even one seat isn't available, the whole request is rejected
   with `409 Conflict` - no partial holds.

This is what stops two customers from ever being sold the same seat when
they click "book" at the same instant.

A `@Scheduled` job (`HoldExpiryService`) runs every 30 seconds, finds any
`HELD` seat whose hold has expired, releases it back to `AVAILABLE`, and
marks its booking `EXPIRED` if it was still `PENDING`.

## Building / testing the build

```bash
mvn -DskipTests compile   # quick compile check
mvn test                  # run tests
mvn spring-boot:run       # run the app
```
