<<<<<<< HEAD
# Online Railway Reservation System (MongoDB)

A runnable educational full-stack project using HTML, CSS, Bootstrap 5, browser JavaScript, Node.js, Express, MongoDB and Mongoose.

> This is a demonstration reservation application, not an official railway booking service. Train schedules, fares and payment processing are sample data. Mock payment never contacts a bank or payment gateway.

## Requirements
- Node.js 18+ and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## Run in VS Code

1. Extract `Online_Railway_Reservation_System_MongoDB.zip`.
2. Open the extracted `railway-reservation` folder in VS Code.
3. Open a terminal in that folder and install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`. On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS/Linux:

   ```bash
   cp .env.example .env
   ```

5. Make sure MongoDB is running. The default local connection is:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/railway_reservation
   ```

   For Atlas, replace it with your Atlas connection string and allow your computer's IP address in Atlas Network Access.

6. Change `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`.
7. Seed stations, 10 trains, routes, upcoming 30-day schedules and the admin account:

   ```bash
   npm run seed
   ```

8. Start the development server:

   ```bash
   npm run dev
   ```

   Or start production mode:

   ```bash
   npm start
   ```

9. Open **http://localhost:3000**.

## Demo admin
The defaults are `admin@railway.local` / `Admin@12345`. They are only used when seeding and can be changed in `.env` before running `npm run seed`. Change them before using the application beyond local demonstration.

## Main workflows
- Register and log in as a passenger.
- Search by station code and journey date.
- Choose a train/class and enter passenger details.
- Create a booking; the backend atomically decrements schedule seats within a MongoDB transaction.
- Complete a mock UPI/debit/credit payment or simulate a failure.
- View bookings, check PNR and cancel an eligible booking.
- Log in as admin to view basic statistics, reservations, add trains and delete trains.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin-login`
- `GET /api/auth/me`
- `GET /api/trains/stations`
- `GET /api/trains/search?from=HYB&to=VSKP&date=YYYY-MM-DD`
- `GET /api/trains`
- `POST /api/trains` (admin)
- `PUT /api/trains/:id` (admin)
- `DELETE /api/trains/:id` (admin)
- `POST /api/bookings` (authenticated)
- `GET /api/bookings/mine` (authenticated)
- `GET /api/bookings/pnr/:pnr` (authenticated)
- `POST /api/bookings/:id/pay` (authenticated, mock)
- `POST /api/bookings/cancel/:pnr` (authenticated)
- `GET /api/bookings/admin/all` (admin)

Send the JWT as `Authorization: Bearer <token>` for protected API calls.

## Important implementation notes
- Passwords are hashed with bcryptjs. Password fields are excluded from normal Mongoose queries.
- JWT authentication and admin-role middleware protect private endpoints.
- Booking seat decrements and cancellation seat restoration use MongoDB transactions. Transactions require a replica set; MongoDB Atlas supports this. For local development, configure MongoDB as a single-node replica set if transaction errors occur. A standalone local MongoDB server does not support transactions.
- A schedule is created on demand for a searched date if one does not exist, using the train's configured initial seat capacity.
- PNR is a unique 10-digit number. A unique database index prevents duplicate PNRs.
- The mock payment endpoint stores only method, amount, status and a generated reference. It does not collect or store card number, CVV, PIN or UPI credentials.
- The cancellation endpoint only allows the logged-in owner to cancel their booking and prevents repeat cancellation.
- PDF ticket saving is available through the browser's Print dialog (`Print` → `Save as PDF`).
- Admin train creation uses default sample class fares/capacities; edit API is available for further administration.

## MongoDB collections
`users`, `admins`, `stations`, `trains`, `trainroutes`, `schedules`, `bookings`, `passengers`, `payments`, `cancellations`.

## Troubleshooting
- **MongoDB connection refused:** start MongoDB service or verify `MONGODB_URI`.
- **Authentication/JWT errors:** ensure `.env` exists and `JWT_SECRET` is set; restart the server after changes.
- **Transaction/replica set error:** use MongoDB Atlas or configure local MongoDB as a replica set.
- **Port in use:** set a different `PORT` in `.env`.
- **No trains found:** seed the database and use a seeded route/date. Seed schedules cover the next 30 days.

## Suggested manual test checklist
1. Register a new user and log in.
2. Search HYB → VSKP for a date within the next 30 days.
3. Book one passenger in SL and complete mock payment.
4. Confirm the booking appears in My Bookings and PNR lookup.
5. Cancel it and verify the status changes to Cancelled.
6. Log in as admin and verify trains and reservation statistics.
=======
# Railway_Booking
>>>>>>> 8f7609b1651a74e07a92df6832fc16343b2eff3d
