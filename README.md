# 🏠 Smart Rent

A full-stack house rental platform built with **React**, **Express**, **MongoDB**, and **JWT** authentication. Two roles — **Tenant** and **Landlord** — each with their own dashboard and permissions.

## 📁 Project Structure

```
smart-rent/
├── backend/          Express + MongoDB REST API
└── frontend/         React + Vite + Tailwind CSS
```

## ✨ Features

- JWT authentication with hashed passwords (bcrypt)
- Role-based access control (tenant / landlord) — enforced on both frontend routes AND backend middleware
- Landlord: add / edit / delete houses, view booking requests, accept / reject
- Tenant: search & filter houses, view details, request bookings, view / cancel own bookings
- Booking logic: when a landlord approves one request, the house is marked unavailable and all other pending requests for it are auto-rejected
- Search & filter by location, rent range, bedrooms, property type

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string (use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier, or a local MongoDB instance)
- `JWT_SECRET` — any long random string

Then run:

```bash
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` already points to `http://localhost:5000/api` — change it only if your backend runs elsewhere.

Then run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Try it out

1. Open `http://localhost:5173`
2. Register two accounts — one as **landlord**, one as **tenant**
3. As landlord: add a house from the dashboard
4. As tenant: search the house, view details, and send a booking request
5. As landlord: accept or reject the request from **Booking Requests**

## 🗄️ Database Collections

- `users` — tenant & landlord accounts (password hashed with bcrypt)
- `houses` — property listings, linked to a landlord
- `bookings` — booking requests, linked to a house + tenant + landlord

## 🔐 API Overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET/PUT | `/api/auth/profile` | Private |
| GET | `/api/houses` | Public (supports `?location=&minRent=&maxRent=&bedrooms=&propertyType=`) |
| GET | `/api/houses/:id` | Public |
| GET | `/api/houses/my-houses` | Landlord |
| POST/PUT/DELETE | `/api/houses` | Landlord (owner only for edit/delete) |
| POST | `/api/bookings` | Tenant |
| GET | `/api/bookings/my-bookings` | Tenant |
| GET | `/api/bookings/requests` | Landlord |
| PUT | `/api/bookings/:id/approve` \| `/reject` | Landlord (owner only) |
| PUT | `/api/bookings/:id/cancel` | Tenant (owner only) |

## 🧩 Next Steps (Phase 7 ideas)

- Multiple image upload per house (currently single image URL)
- Favorites / wishlist
- Reviews & ratings collection
- In-app + email notifications on booking status change

## 📦 Deployment

- Frontend → Vercel / Netlify
- Backend → Render / Railway
- Database → MongoDB Atlas
