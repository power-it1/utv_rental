# Adventure Rentals - Motorcycle, UTV & Guided Tour Platform 🏍️

A complete, production-ready rental management platform built with Next.js 15, TypeScript, Tailwind CSS v4, and Supabase. Features a comprehensive admin panel for managing vehicles, rentals, and customers.

## ✨ Key Features

### Customer-Facing
- **Vehicle Browsing**: Filter and search motorcycles, UTVs, and guided tours
- **Easy Booking**: Simple rental booking flow with date selection
- **User Dashboard**: View and manage rental history
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **PWA Support**: Install as a progressive web app with offline capabilities
- **Social Proof**: Trust indicators and customer ratings on homepage

### Admin Panel
- **📊 Dashboard**: Real-time stats, revenue tracking, and quick actions
- **🏍️ Vehicle Management**: Full CRUD for motorcycles, UTVs, and tours
- **📋 Rental Management**: Approve/reject bookings, manage rental lifecycle
- **👥 Customer Management**: View users, manage roles, track customer activity
- **🔒 Role-Based Access**: Secure admin routes with middleware protection
- **📝 Admin Notes**: Add internal notes to rentals for team coordination
- **📍 GPS Tracking**: Track vehicle locations in real-time (demo mode)

### UX Enhancements
- **Smooth Animations**: Fade-in transitions and staggered loading effects
- **Empty States**: Friendly, actionable messaging when no data is available
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Loading States**: Optimized spinners and skeleton screens
- **Mobile-First**: Fully responsive layouts with touch-optimized controls

## 🎨 Design System

Custom color palette designed for trust and adventure:
- **Orange (#E76F51)**: Primary actions and highlights
- **Pine Green (#264653)**: Headers, navigation, trust elements
- **Sand Beige (#F4A261)**: Warm accents and backgrounds
- **Rock Gray (#6D6875)**: Body text and secondary elements
- **Sky White (#FAFAFA)**: Clean backgrounds

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.4 (App Router, React Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4.1.14 (with CSS @theme configuration)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth with role-based access control
- **State Management**: React Hooks + Server Components
- **PWA**: Progressive Web App with offline support and installability
- **SEO**: Optimized metadata, sitemap, and robots.txt
- **Deployment**: Vercel-optimized

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Supabase account
- Git

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd bike_rental
   yarn install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run `supabase/schema.sql`
   - Note your Project URL and anon key from Settings → API

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run development server**
   ```bash
   yarn dev
   ```

   Visit [http://localhost:3001](http://localhost:3001)

5. **Create admin account**
   - Sign up at `/auth/signup`
   - In Supabase: Table Editor → `profiles` → find your user
   - Change `role` from `user` to `admin`
   - Sign in again to access `/admin`

📖 **Full setup guide**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md)

## � Project Structure

```
bike_rental/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin panel (protected routes)
│   │   │   ├── customers/      # Customer management
│   │   │   ├── rentals/        # Rental approval & management
│   │   │   ├── vehicles/       # Vehicle CRUD
│   │   │   └── page.tsx        # Dashboard with stats
│   │   ├── auth/               # Signin/signup pages
│   │   ├── my-rentals/         # User rental dashboard
│   │   ├── rentals/            # Public vehicle listings
│   │   └── layout.tsx          # Root layout with Header/Footer
│   ├── components/
│   │   ├── Header.tsx          # Navigation with auth state
│   │   ├── Footer.tsx          # Site footer
│   │   ├── VehicleForm.tsx     # Reusable vehicle create/edit
│   │   └── ToastProvider.tsx   # Global notifications
│   ├── lib/
│   │   └── supabase.ts         # Supabase client setup
│   └── middleware.ts           # Route protection & auth
├── supabase/
│   └── schema.sql              # Complete database schema
├── ADMIN_SETUP.md              # Admin account creation guide
├── DEPLOYMENT.md               # Vercel deployment guide
└── README.md                   # This file
```

## 🔐 Security Features

- **Row-Level Security (RLS)**: Database policies enforce access control
- **Middleware Protection**: Admin routes protected at Next.js level
- **Role-Based Access**: User/Admin roles with granular permissions
- **Secure Authentication**: Supabase Auth with email verification
- **Environment Variables**: Sensitive data never committed to git

## 🎯 Core Pages

### Public Routes
- `/` - Homepage with hero and vehicle types
- `/rentals` - Browse all available vehicles
- `/rentals/[id]` - Vehicle details and booking
- `/auth/signin` - User login
- `/auth/signup` - User registration

### Authenticated Routes
- `/my-rentals` - User's rental history and status

### Admin Routes (Protected)
- `/admin` - Dashboard with stats and quick actions
- `/admin/vehicles` - Vehicle management
- `/admin/rentals` - Rental approval workflow
- `/admin/customers` - Customer and role management

## � Database Schema

Tables created by `schema.sql`:
- **profiles**: User info with roles (user/admin)
- **vehicles**: Motorcycles, UTVs, guided tours
- **rentals**: Booking records with status workflow
- **gps_tracking**: Real-time location data (prepared for future)
- **activity_logs**: Audit trail (prepared for future)

## 🚀 Deployment to Vercel

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

**Detailed guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Production Checklist
- ✅ Environment variables configured
- ✅ Database schema deployed
- ✅ Admin account created
- ✅ Sample vehicles added
- ✅ SSL enabled (automatic on Vercel)
- ✅ SEO metadata configured
- ✅ Error boundaries in place
- ✅ Loading states implemented
- ✅ PWA manifest and service worker configured
- ✅ Mobile responsiveness verified
- ✅ Sitemap and robots.txt optimized

## 🎬 MVP Demo Script

Perfect for partner presentations:

1. **Homepage** - Show hero and vehicle types
2. **Browse Rentals** - Filter vehicles, view details
3. **User Flow** - Sign up, book a rental
4. **Admin Dashboard** - Show stats and management tools
5. **Vehicle Management** - Create/edit vehicles
6. **Rental Workflow** - Approve bookings, manage lifecycle
7. **Customer Management** - View users, manage roles

## 🔧 Development Commands

```bash
# Development server
yarn dev

# Production build (test before deploy)
yarn build

# Start production server locally
yarn start

# Type checking
yarn type-check

# Linting
yarn lint
```

## 📝 Environment Variables

Required for production:
```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
```

Optional:
```env
NEXT_PUBLIC_SITE_URL=            # Your domain (for SEO)
```

## 🤝 Contributing

This is an MVP. Future enhancements:
- [ ] GPS tracking with live maps
- [ ] Activity logs viewer
- [ ] Image uploads for vehicles
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced analytics

## 📄 License

Private project for business use.

## 🆘 Support

- **Setup Issues**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database**: Check Supabase docs and `schema.sql` comments

---

**Built with ❤️ for Adventure Rentals**

Ready for production deployment and partner presentations! 🚀
