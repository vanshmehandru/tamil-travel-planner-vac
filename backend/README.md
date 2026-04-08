# 🚌 நம்ம யாத்திரை — Namma Yatra Backend API

> Tamil Travel Booking System | Node.js + Express + MongoDB

---

## 🗂️ Project Structure

```
namma-yatra/
├── src/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── TravelOption.js    # Train / Bus / Flight options
│   │   ├── Booking.js         # Booking schema
│   │   └── Ticket.js          # Ticket schema
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, Profile
│   │   ├── travelController.js# Search, Seat availability
│   │   ├── bookingController.js # Create, Cancel, History
│   │   ├── ticketController.js  # Fetch, Download tickets
│   │   └── nlpController.js   # Tamil NLP input parser
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── travelRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── nlpRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validate.js        # express-validator helper
│   ├── services/
│   │   └── ticketService.js   # Ticket generation logic
│   └── data/
│       └── seed.js            # DB seeder with mock data
├── .env                       # Environment variables
├── package.json
```

---

## ⚙️ Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET

# 3. Seed mock travel data
npm run seed

# 4. Start development server
npm run dev

# 5. Production start
npm start
```

---

## 🔑 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/namma_yatri
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 📡 API Endpoints

### Authentication  `/api/auth`

| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/register`           | Public  | Register new user        |
| POST   | `/login`              | Public  | Login and get JWT token  |
| GET    | `/me`                 | Private | Get current user profile |
| PUT    | `/profile`            | Private | Update profile           |
| PUT    | `/change-password`    | Private | Change password          |

### Travel  `/api/travel`

| Method | Endpoint            | Access | Description                      |
|--------|---------------------|--------|----------------------------------|
| GET    | `/search`           | Public | Search travel options            |
| GET    | `/options`          | Public | List all options (with filters)  |
| GET    | `/:id`              | Public | Get single travel option         |
| GET    | `/:id/seats`        | Public | Get seat availability            |

### Bookings  `/api/bookings`

| Method | Endpoint                  | Access  | Description         |
|--------|---------------------------|---------|---------------------|
| POST   | `/`                       | Private | Create new booking  |
| GET    | `/my-bookings`            | Private | Order history       |
| GET    | `/:bookingId`             | Private | Get booking detail  |
| PUT    | `/:bookingId/cancel`      | Private | Cancel booking      |

### Tickets  `/api/tickets`

| Method | Endpoint              | Access  | Description               |
|--------|-----------------------|---------|---------------------------|
| GET    | `/my-tickets`         | Private | All tickets for user      |
| GET    | `/pnr/:pnrNumber`     | Public  | Check PNR status          |
| GET    | `/:ticketId`          | Private | Get ticket by ID          |
| GET    | `/:ticketId/download` | Private | Download/export ticket    |

### NLP  `/api/nlp`

| Method | Endpoint     | Access | Description                      |
|--------|--------------|--------|----------------------------------|
| POST   | `/parse`     | Public | Parse Tamil text input           |
| GET    | `/cities`    | Public | City autocomplete suggestions    |

---

## 📬 Sample Requests & Responses

### 1. Register
**POST** `/api/auth/register`
```json
{
  "username": "murugan123",
  "email": "murugan@example.com",
  "password": "secret123",
}
```
**Response:**
```json
{
  "success": true,
  "message": "பதிவு வெற்றிகரமாக முடிந்தது! நம்ம யாத்ரிக்கு வரவேற்கிறோம்!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "username": "murugan123",
    "email": "murugan@example.com"
  }
}
```

---

### 2. Search Travel
**GET** `/api/travel/search?source=MAS&destination=CBE&type=train&date=2024-12-25&passengers=2`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "searchParams": {
    "source": "MAS",
    "destination": "CBE",
    "type": "train",
    "date": "2024-12-25",
    "passengers": 2
  },
  "data": [
    {
      "_id": "65abc456...",
      "type": "train",
      "trainNumber": "12681",
      "trainName": "கோவை சூப்பர்ஃபாஸ்ட்",
      "sourceName": "சென்னை சென்ட்ரல்",
      "destinationName": "கோவை",
      "departureTime": "15:10",
      "arrivalTime": "21:55",
      "duration": "6h 45m",
      "pricing": [
        { "class": "SL", "price": 350, "availableSeats": 55 },
        { "class": "3A", "price": 960, "availableSeats": 28 }
      ],
      "foodService": { "available": true, "vegOption": true }
    }
  ]
}
```

---

### 3. Create Booking
**POST** `/api/bookings`  *(Authorization: Bearer <token>)*
```json
{
  "travelOptionId": "65abc456...",
  "travelClass": "3A",
  "travelDate": "2024-12-25",
  "passengers": [
    {
      "name": "முருகன் செல்வம்",
      "age": 35,
      "gender": "male",
      "idType": "aadhaar",
      "idNumber": "123456789012",
      "seatPreference": "lower"
    }
  ],
  "foodPreference": "veg",
  "luggageAllowance": 15,
  "paymentMethod": "upi"
}
```
**Response:**
```json
{
  "success": true,
  "message": "பயண பதிவு வெற்றிகரமாக முடிந்தது!",
  "booking": {
    "bookingId": "TRN3456789012",
    "status": "confirmed",
    "route": "சென்னை சென்ட்ரல் → கோவை",
    "travelDate": "2024-12-25T00:00:00.000Z",
    "totalAmount": 1076,
    "totalPassengers": 1,
    "ticketId": "NYT-TKT-89012345-4567",
    "pnrNumber": "4567890123"
  }
}
```

---

### 4. Get Ticket (Download)
**GET** `/api/tickets/NYT-TKT-89012345-4567/download`  *(Authorization: Bearer <token>)*

**Response:**
```json
{
  "success": true,
  "message": "டிக்கெட் விவரங்கள்",
  "ticket": {
    "appName": "நம்ம யாத்ரி",
    "ticketId": "NYT-TKT-89012345-4567",
    "pnrNumber": "4567890123",
    "isValid": true,
    "journey": {
      "type": "train",
      "vehicle": "கோவை சூப்பர்ஃபாஸ்ட் (12681)",
      "class": "3A",
      "from": "சென்னை சென்ட்ரல் (MAS)",
      "to": "கோவை (CBE)",
      "date": "2024-12-25T00:00:00.000Z",
      "departure": "15:10",
      "arrival": "21:55",
      "duration": "6h 45m",
      "platformOrGate": "Platform 4"
    },
    "passengers": [
      {
        "name": "முருகன் செல்வம்",
        "age": 35,
        "gender": "male",
        "seatNumber": "B1-01",
        "seatClass": "3A"
      }
    ],
    "fare": {
      "baseFare": 960,
      "taxes": 48,
      "totalAmount": 1076,
      "foodPreference": "veg",
      "luggageAllowance": 15
    }
  }
}
```

---

### 5. Tamil NLP Input Parser
**POST** `/api/nlp/parse`
```json
{
  "text": "சென்னையிலிருந்து கோவைக்கு நாளை ரயிலில் போக வேண்டும்"
}
```
**Response:**
```json
{
  "success": true,
  "parsed": {
    "source": "MAS",
    "destination": "CBE",
    "travelType": "train",
    "date": "2024-12-26",
    "passengers": 1,
    "confidence": "high",
    "rawInput": "சென்னையிலிருந்து கோவைக்கு நாளை ரயிலில் போக வேண்டும்"
  },
  "suggestions": [],
  "searchUrl": "/api/travel/search?source=MAS&destination=CBE&type=train&date=2024-12-26"
}
```

---

## 🗃️ Database Collections

| Collection      | Purpose                                         |
|-----------------|-------------------------------------------------|
| `users`         | Registered user accounts                        |
| `traveloptions` | Train / Bus / Flight schedules & pricing        |
| `bookings`      | All booking records with passenger details      |
| `tickets`       | Generated tickets with PNR and journey snapshot |

---

## 🛡️ Security Features

- **JWT Authentication** with 7-day expiry
- **bcrypt** password hashing (12 rounds)
- **Rate limiting** — 100 req/15min globally, 10 req/15min for auth
- **Helmet.js** HTTP security headers
- **Input validation** via express-validator
- **ID number masking** in tickets (shows last 4 digits only)

---

## 🌱 Mock Data Routes (after seeding)

| Route                                                     | Type   |
|-----------------------------------------------------------|--------|
| சென்னை → கோவை (Train: 12681 கோவை சூப்பர்ஃபாஸ்ட்)       | Train  |
| கோவை → சென்னை (Train: 12163 சென்னை எக்ஸ்பிரஸ்)          | Train  |
| சென்னை → மதுரை (Train: 12637 பாண்டியன் எக்ஸ்பிரஸ்)      | Train  |
| சென்னை → கோவை (Bus: TNSTC Super Express)                 | Bus    |
| கோவை → மதுரை (Bus: KPN Sleeper)                          | Bus    |
| சென்னை → மதுரை (Bus: Parveen Travels AC)                 | Bus    |
| சென்னை → கோவை (Flight: IndiGo 6E-543)                   | Flight |
| சென்னை → மதுரை (Flight: Air India AI-433)                | Flight |
| கோவை → சென்னை (Flight: SpiceJet SG-101)                 | Flight |
