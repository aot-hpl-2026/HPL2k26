# HPL 2026 - Hostel Premier League Management System

A production-ready cricket tournament management system for HPL 2026, featuring real-time live scoring, team management, player statistics, and public viewing.

## 🏏 Features

- **6 Teams**: Pre-configured with logos, colors, and mottos
- **Live Scoring**: Real-time score updates via Socket.IO
- **Public Viewing**: Anyone can watch live matches
- **Admin Control**: Only authenticated admins can update scores
- **Stats Tracking**: Comprehensive batting, bowling, and fielding statistics
- **Points Table**: Automatic calculation with NRR

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) with ES Modules
- **Express.js** - REST API framework
- **MongoDB** - Database with Mongoose ODM
- **Redis** - Caching and Socket.IO adapter
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Joi** - Input validation
- **Helmet** - Security headers

### Frontend
- **React 18** with Vite
- **TailwindCSS** + **DaisyUI** - Styling
- **TanStack Query** - Data fetching
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Redis (optional, has in-memory fallback)

### Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Seed initial data (6 teams + admin)
npm run seed

# Development
npm run dev

# Production
npm start
```

### Frontend Setup

```bash
cd frontend
npm install

# Development
npm run dev

# Production build
npm run build
npm run preview
```

## ⚙️ Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/hpl2026

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_USE_MOCK=false
```

## 🔐 Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Configurable origin restrictions
- **Rate Limiting** - API and auth-specific limits
- **Input Validation** - Joi schemas for all endpoints
- **JWT Authentication** - Secure admin access
- **Password Hashing** - bcrypt with salt rounds

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Configure specific `CORS_ORIGIN` (not `*`)
4. Set up MongoDB Atlas and Redis Cloud
5. Use PM2 or similar for process management

### Frontend
1. Run `npm run build`
2. Deploy `dist/` folder to CDN/static hosting
3. Configure API URL in environment

## 📡 API Endpoints

### Public (No Auth Required)
- `GET /health` - Health check
- `GET /api/teams` - All teams
- `GET /api/teams/points-table` - Points table
- `GET /api/matches` - All matches
- `GET /api/matches/live` - Live matches
- `GET /api/players` - All players
- `GET /api/players/top-batsmen` - Top run scorers
- `GET /api/players/top-bowlers` - Top wicket takers

### Admin (Auth Required)
- `POST /api/auth/login` - Admin login
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `POST /api/matches` - Schedule match
- `PUT /api/matches/:id` - Update match status
- `POST /api/matches/:id/score` - Record ball

## 🔌 Real-time Events

### Socket Namespaces
- `/public` - Public viewers (subscribe to matches)
- `/admin` - Authenticated admins (send score updates)

### Events
- `score:update` - Live score update
- `innings:started` - New innings began
- `subscribe` - Join match room (public)
- `unsubscribe` - Leave match room (public)

## 👤 Default Admin

- **Email**: admin@hpl.com
- **Password**: admin123

⚠️ **Change these credentials in production!**

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # Database, Redis, env
│   │   ├── controllers/   # Route handlers
│   │   ├── middlewares/   # Auth, validation, errors
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.IO handlers
│   │   ├── utils/         # Helpers
│   │   ├── seed.js        # Database seeder
│   │   └── server.js      # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/images/     # Team logos
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Socket services
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helpers
│   └── package.json
```

## 📖 Overview

HPL 2026 is a full-stack web application for managing cricket tournaments, designed for hostel leagues. It supports live scoring, team and player management, public viewing, and admin controls. The backend is built with Node.js/Express/MongoDB/Redis, and the frontend uses React, Vite, and TailwindCSS.

---

## Contributing

1. Fork the repo and clone your fork.
2. Create a new branch for your feature or fix.
3. Make changes and commit with clear messages.
4. Push to your fork and open a Pull Request.
5. Follow code style and add tests if possible.

---

## Development Best Practices

- Use environment variables for secrets and config.
- Never commit .env or node_modules.
- Use `npm run dev` for local development.
- Write clear commit messages and PR descriptions.
- Use ESLint and Prettier for code quality.
- Document new endpoints and features in README.

---

## Troubleshooting

- **MongoDB/Redis not running**: Check connection strings and service status.
- **Socket.IO not connecting**: Verify frontend URLs and CORS settings.
- **API errors**: Check logs in backend terminal and ensure .env is correct.
- **Frontend build issues**: Delete node_modules, reinstall, and retry build.

---

## Further Reading

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)

---

## Contact

For questions, open an issue or contact the maintainer: [ankit.kumar@email.com](mailto:ankit.kumar@email.com)

---

## 🏆 The 6 HPL Teams

| Team | Short | Hostel | Colors |
|------|-------|--------|--------|
| Narayani Sena | NS | Hostel A | Maroon & Gold |
| Kurukshetra Kings | KK | Hostel B | Navy & Silver |
| Barbarika XI | BXI | Hostel C | Royal Blue & Gold |
| Indraprastha Warriors | IW | Hostel D | Bronze & Slate |
| Vaikartan Sena | VS | Hostel E | Burgundy & Gold |
| Chakravyuha Vidhvansak | CV | Hostel F | Charcoal & Orange |

## 📝 License

MIT License - Built for HPL 2026
