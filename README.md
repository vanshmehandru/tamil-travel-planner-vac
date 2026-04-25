# 🚀 Namma Yatra - Tamil Travel Planner

**Namma Yatra** (நம்ம யாத்திரை) is a modern, full-stack travel booking and planning application tailored for Tamil-speaking users. It leverages cutting-edge AI (Google Gemini) to provide a seamless travel experience, from searching for routes to generating digital tickets.

🌐 **Hosted URL:** [https://nammayatra.vercel.app/](https://nammayatra.vercel.app/)

---

## ✨ Features

- **🤖 AI-Powered Search:** Natural language travel search using Google Gemini AI, supporting Tamil queries.
- **🚆 Multimodal Travel:** Search and book for Flights, Trains, and more.
- **🎫 Digital Tickets:** Automated ticket generation with QR codes and PDF export.
- **🔐 Secure Authentication:** JWT-based user authentication with protected routes.
- **📱 Responsive UI:** Premium, mobile-friendly design built with React and Tailwind CSS.
- **🌍 Localization:** Deep support for Tamil language throughout the application.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **AI Integration:** [Google Gemini AI](https://ai.google.dev/)
- **Security:** Helmet, CORS, Express Rate Limit, JWT
- **Utilities:** PDFKit (PDF generation), QR-Image (QR code generation)

---

## 🗂️ Project Structure

The project is divided into two main parts:

- **[Frontend (React + Vite)](file:///c:/Users/HP/OneDrive/Desktop/WEB%20DEV/namma-yatra/frontend/README.md):** The user interface and client-side logic.
- **[Backend (Node + Express)](file:///c:/Users/HP/OneDrive/Desktop/WEB%20DEV/namma-yatra/backend/README.md):** The API server, AI integration, and database management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 20.0.0)
- MongoDB account (Atlas or local)
- API Keys for Gemini OR AviationStack, and RapidAPI (IRCTC)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vanshmehandru/tamil-travel-planner-vac.git
   cd namma-yatra
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm run seed # To populate mock travel data
   ```
   Create a `.env` file in the `backend` directory (see [Environment Variables](#environment-variables)).

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the application:**
   - **Backend (Dev):** `npm run dev` (from `backend` folder)
   - **Frontend (Dev):** `npm run dev` (from `frontend` folder)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development

# AI Keys
GEMINI_NLP_KEY=your_gemini_api_key
GEMINI_TRAVEL_KEY=your_gemini_api_key

# External APIs
AVIATIONSTACK_API_KEY=your_aviationstack_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=irctc-indian-railway-pnr-status.p.rapidapi.com
RAILRADAR_API_KEY=your_railradar_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📸 Screenshots

<img width="1900" height="905" alt="image" src="https://github.com/user-attachments/assets/e06173f8-b15b-454f-beb9-5d2d5e8e777e" />


---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Developed with ❤️.**
