# Next.js Client - Universal Starter Template

Production-ready Next.js 14 frontend with App Router, Tailwind CSS, and Supabase authentication.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS
- 🔐 Supabase Authentication
- 📊 Recharts for data visualization
- 🎯 React Context API for state management
- 🛣️ Protected routes
- 📱 Fully responsive design
- 🌙 Dark mode support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
nextjs-client/
├── app/                    # App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── home/              # Home page
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Root page
├── components/            # Reusable components
├── context/               # React Context providers
├── lib/                   # Utilities and services
└── public/                # Static assets
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- Axios
- Recharts
- Lucide React (icons)

## License

MIT
