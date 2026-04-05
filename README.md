# AXNOIZ

A mobile-first PWA for daily subconscious conditioning and manifestation — built on the philosophical pillars of Joseph Murphy, Napoleon Hill, and Rhonda Byrne.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Auth & Database | Supabase (PostgreSQL, RLS, Auth) |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Background | tsparticles (`UniverseBackground`) |
| Icons | Lucide React |
| Email SMTP | Gmail (`smtp.gmail.com:587`, `axnoiz111@gmail.com`) |
| Hosting | (to be configured) |

---

## Design System

**Color Tokens**
```
#050A18  — page background
#0A1628  — card background
#0F1F3D  — elevated surface
#6C63FF  — primary violet (accent, CTAs)
#00D4FF  — cyan (secondary accent)
#FFB347  — amber (streak/fire)
#F0F4FF  — bright text
#8B9DC3  — muted text
#4A5A7A  — dim text / labels
rgba(108,99,255,0.12) — border
```

**Typography**
- `font-display` — display/heading class
- `font-display-italic` — italic display (quotes)
- Base font: `inherit` (system/custom font set in `index.css`)

---

## Project Structure

```
src/
├── App.tsx                         # Router + AuthProvider wrapper
├── main.tsx
├── index.css                       # Global CSS variables + utility classes
│
├── contexts/
│   └── AuthContext.tsx             # Global auth state (user, session, signIn/signUp/signOut)
│
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx          # Sign in / Create account modal (multi-step)
│   │   └── ProtectedRoute.tsx      # Redirects unauthenticated users to /
│   ├── landing/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Intro.tsx
│   │   ├── WhatIsAxnoiz.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Philosophy.tsx
│   │   ├── SocialProof.tsx
│   │   ├── FinalCTA.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── UniverseBackground.tsx  # tsparticles star field (reused across pages)
│       ├── CosmicBackground.tsx
│       ├── StarField.tsx
│       ├── Reveal.tsx              # Scroll-triggered fade-in wrapper
│       └── FloatingArrow.tsx
│
├── pages/
│   ├── Landing.tsx                 # Public homepage with LoginModal
│   ├── Dashboard.tsx               # Main app home (protected)
│   ├── CompleteProfile.tsx         # First-time onboarding gate (protected)
│   ├── Profile.tsx                 # Edit profile page (protected)
│   └── ResetPassword.tsx           # Password reset via email link (unprotected)
│
└── lib/
    └── supabase.ts                 # Supabase client init
```

---

## Auth Flow

1. **Landing page** (`/`) — public. Contains `LoginModal` triggered by CTA buttons.
2. **LoginModal** — two modes:
   - **Sign in**: email + password → success animation → `/dashboard`
   - **Create account**: email + password → Supabase sends confirmation email → "Check inbox" screen
   - **Forgot password**: email → Supabase sends reset link → `forgot_sent` screen
   - **Duplicate account detection**: `signUp` with existing email returns `identities.length === 0` → auto-switch to sign-in mode
3. **Email confirmation** — user clicks link in Gmail → lands on `/dashboard`
4. **Reset password** (`/reset-password`) — unprotected. Listens for `PASSWORD_RECOVERY` auth event, shows new password form, saves via `supabase.auth.updateUser({ password })`.
5. **ProtectedRoute** — wraps `/dashboard`, `/complete-profile`, `/profile`. Redirects to `/` if no active session.

### AuthContext API
```tsx
const { user, session, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth()

// signUpWithEmail returns:
// { sessionCreated: boolean, alreadyExists: boolean }
```

---

## Onboarding Flow (First Login)

After sign-up and email confirmation:
1. Dashboard checks `profiles.full_name` for the current user
2. If `null` → redirects to `/complete-profile`
3. User fills: Full Name (required), Age, Gender, WhatsApp
4. Submit → `profiles` upsert → redirect to `/dashboard`

---

## Database Schema

### `public.profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users(id)` ON DELETE CASCADE |
| `email` | TEXT | |
| `full_name` | TEXT | Used for greeting and initials avatar |
| `age` | INTEGER | CHECK > 0 AND < 120 |
| `gender` | TEXT | CHECK IN ('male', 'female', 'other') |
| `whatsapp` | TEXT | For future weekly report delivery |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**RLS Policies**
- SELECT: user can read own profile
- INSERT: user can insert own profile
- UPDATE: user can update own profile

**Triggers**
- `handle_new_user` — auto-creates a profile row on `auth.users` INSERT
- `update_updated_at` — updates `updated_at` on profile UPDATE

---

## Dashboard (`/dashboard`)

- Time-based greeting: Good morning / Good afternoon / Good evening + first name
- Profile avatar (top right): initials in violet gradient circle → links to `/profile`
- **Card 1 — Today's Status**: "Begin Today's Session" CTA or "You showed up today" if complete
- **Card 2 — Streak**: 14-day dot calendar (today pulses violet), day count
- **Card 3 — Declared Desire**: Shows user's goal or "Declare Your Desire →" CTA
- **Card 4 — Philosophy Quote**: Napoleon Hill quote block
- **Bottom nav**: Home | Session | Tracker | Profile

---

## Supabase Configuration

- **Project ID**: `vutrvjdynhfcpicfzmlg`
- **Auth > Email > Custom SMTP**: Gmail `smtp.gmail.com:587`, username `axnoiz111@gmail.com`
- **Confirm email**: enabled (user must click confirmation link)
- **Email template**: Confirmation uses `{{ .ConfirmationURL }}` (not OTP)
- **Google OAuth**: registered at Auth > Providers > Google (callback URL: `https://vutrvjdynhfcpicfzmlg.supabase.co/auth/v1/callback`)

---

## Environment Variables

Create `.env` in `axnoiz/`:
```
VITE_SUPABASE_URL=https://vutrvjdynhfcpicfzmlg.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

---

## Dev Setup

```bash
cd axnoiz
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

---

## Git Repository

Remote: `https://github.com/axnoiz111/axnoiz`  
Branch: `master`

---

## Roadmap (Not Yet Built)

- `/session` — Daily conditioning session (audio/affirmations)
- `/tracker` — Habit and streak tracking
- `/onboarding` — Goal / desire declaration flow
- Streak logic wired to real session data
- WhatsApp weekly progress reports
- OpenAI integration for personalised affirmation scripts
