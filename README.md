# SocialDev Nigeria - AI Learning Platform

AI-powered conversational learning platform for Nigerian primary school children (ages 5-10).

## 🎨 Features

- **AI-Powered Learning**: Conversational AI teacher using Google Gemini
- **Pixel Art Design**: Beautiful 8-bit retro game aesthetic
- **Multi-Role System**: Superadmin, School Admin, Parent, and Student portals
- **Nigerian Context**: Cultural examples and formal Nigerian English
- **Subscription Management**: ₦2,000 per child for 3 months with 7-day free trial
- **PWA Ready**: Installable on tablets and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project (already configured)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 👥 User Roles & Access

### Superadmin
- **Login**: `/superadmin/access/login`
- **Credentials**: `superadmin@socialdev.ng` / `SuperSecure2025!`
- **Access**: Create schools, manage all data, view analytics

### School Admin
- **Login**: `/{school-slug}/admin/login`
- **Access**: Create students & parents, manage school data

### Parent
- **Login**: `/{school-slug}/parent/login`
- **Access**: View children's progress, manage subscriptions

### Student
- **Login**: `/{school-slug}/pupil/login`
- **Access**: AI learning interface, chat with AI teacher

## 🎓 Student Learning Flow

1. **Onboarding**: Select career aspiration and hobbies
2. **7-Day Free Trial**: Starts on first login
3. **AI Conversations**: Ask questions and learn through guided discovery
4. **Subscription**: Parent pays ₦2,000 for 3 months

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini API
- **Payments**: Paystack
- **Emails**: Resend
- **Images**: ImgBB

## 📱 PWA Features

- Offline support
- Home screen installation
- Optimized for tablets (768-1024px)
- Touch-friendly interface

## 🎨 Design System

The app uses a comprehensive pixel art design system:
- **Colors**: Vibrant Nigerian-inspired palette
- **Typography**: Press Start 2P for headings, Fredoka for body
- **Components**: Custom pixel buttons, cards, inputs, badges
- **Animations**: Bounce, float, bubble-in effects

## 🔐 Security

- Role-based access control with Firebase custom claims
- School data isolation in Firestore
- Input validation and sanitization
- Secure subscription handling

## 📦 Environment Variables

The following are already configured:
- Firebase configuration
- Gemini API key
- Resend API key
- ImgBB API key
- Paystack keys (configure as needed)

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy to Vercel, Netlify, or any static hosting service.

## 📧 Email Templates

Emails are sent via Resend for:
- School admin welcome
- Parent welcome with student credentials
- Subscription confirmations
- Payment receipts

## 💳 Subscription Pricing

- **Price**: ₦2,000 per child
- **Duration**: 3 months
- **Trial**: 7 days free (starts on first login)
- **Payment**: Paystack integration

## 📊 Demo Data

Use the superadmin portal to create demo schools and students for testing.

## 🤝 Support

For issues or questions, contact: support@socialdev.ng

## 📄 License

Copyright © 2025 SocialDev Nigeria. All rights reserved.
