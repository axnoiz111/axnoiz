# AXNOIZ — User Experience Guide

> Access your inner voice and remove the noise.

This document describes the complete user experience of AXNOIZ — not just the features, but how the user should feel at every step, and why each decision was made.

---

## The Core Promise

Your subconscious mind does not know the difference between what is real and what is vividly imagined. Feed it the right pictures — daily — and your outer world must change.

AXNOIZ is built entirely on this one truth. Everything the user sees, hears, and does inside the app is designed to reinforce one belief: *what you want is already on its way.*

---

## The Emotional Journey

### Moment 1: Opening the app
A single thought appears — curated from Murphy, Hill, or Byrne — drawn from a rotating set of 30 truths. One each day. The same one all day, so it has time to settle. The user reads it, feels something shift, and taps "Carry This With Me." The session has begun before they've done anything.

### Moment 2: The Home tab
There is no dashboard. No stats. No streak counter. Just a quiet space with a blinking cursor and a message that changes every few seconds:

- *"Tell me your wish, and I'll help you complete it..."*
- *"Tell me what you want, and I'll help you receive it..."*
- *"What does your heart truly desire?"*

The user types what they want — not a goal, not an objective — what they truly want. And something listens. The system goes to work. A pulsing violet orb, cycling messages: *"Reading your desire... Consulting the principles... Crafting your script..."*

Then it appears. Their script. Written in present tense. Written for them. Words their subconscious can accept as true right now.

**The script is saved automatically.** No button. No saving. It just appears in their Scripts tab — ready.

### Moment 3: Reading the script
Below the script is a section: **How to Use This Script** — collapsed by default, available when the user is ready. It walks them through Dr. Joseph Murphy's method:

1. Find 2 minutes of silence
2. Read aloud with conviction — feel it, don't just say it
3. Visualise while reading — see yourself already living it
4. Repeat for 21+ days without exception
5. Act as if it is already done

This is not instructions. It is initiation. The first time a user reads this, they understand that what they are doing is serious, intentional, and backed by decades of documented results.

### Moment 4: Converting to audio
On the Scripts tab, each script has a "Convert to Audio" button. The system calls OpenAI's TTS API using the voice **nova** — warm, calm, intimate. The listener feels like they are hearing their own best self speak these words back to them.

The audio is generated once and stored permanently. The user never has to generate it again. It is theirs.

**Voice settings:** Model `tts-1-hd`, voice `nova`, speed `0.92` — slightly slower than default for deeper absorption.

### Moment 5: The listening session
The Audio tab shows their audio files with a custom player:

- A large play button
- A progress bar they can scrub
- A loop toggle: 1× → 3× → 5× → ∞

They press play and let it run. On a loop. The same words. Over and over. Like water carving stone.

When they stop — or when the loops are done — a bottom sheet slides up:

*"How do you feel?"*

Four options: Okay / Good / Great / Amazing

And one optional field: *"One step you took today..."*

If they fill it in, great. If not, they can skip. Either way, the session is recorded.

### Moment 6: The Tracker
The Tracker tab shows them:

- Total listens
- Sessions this week
- When they last listened
- Recent sessions with mood and action steps
- A mood distribution bar (after 3+ sessions)

This is not gamification. This is a mirror. It shows the user the proof of their own consistency. Over time, it becomes one of the most powerful things in the app — because it reflects their commitment back to them in a way they cannot argue with.

---

## Navigation Structure

| Tab | Icon | Purpose |
|-----|------|---------|
| Home | House | Generate new scripts |
| Scripts | File | Read and manage saved scripts |
| Audio | Headphones | Listen to audio files |
| Tracker | Bar chart | See listening history and mood |
| Profile | Avatar (top right) | Edit name, WhatsApp, age |

---

## Limits (By Design)

| Resource | Limit | Why |
|----------|-------|-----|
| Scripts | 10 | Forces intentional curation. The user keeps what truly resonates. |
| Audio files | 5 | Encourages depth over breadth. Listen deeply to fewer things. |
| Listening sessions | Unlimited | Every session is tracked forever. |

---

## The Daily Thought

Every day, when the user opens the app, they see a single thought drawn from the works of Murphy, Hill, or Byrne. It is shown once per calendar day. It cannot be skipped without reading it first (the dismiss button requires a tap, not a swipe-away).

The thought is deterministic — `thoughts[dayOfYear % 30]` — meaning every user sees the same thought on the same day. This creates a quiet shared experience.

---

## Script Generation (AI)

Scripts are generated via OpenAI GPT-4o through a Supabase Edge Function (`generate-script`). The system prompt instructs the AI to:

- Write in first person, present tense
- Weave in all three philosophical traditions (Murphy, Hill, Byrne)
- Be emotionally charged, not generic
- Flow naturally when read aloud
- End with a powerful closing affirmation of certainty

Scripts are **200–280 words** — long enough to be meaningful, short enough to read in 90 seconds.

**The script is auto-saved to the database.** The user never has to press a save button.

---

## Audio Generation (AI)

Audio is generated via OpenAI TTS (`tts-1-hd`, voice `nova`) through the `generate-audio` edge function. The audio file is uploaded to Supabase Storage and the signed URL is stored. When the user plays the audio, they stream it directly from Supabase Storage.

---

## Stub Mode (Development)

Until an OpenAI API key is configured, the system runs in **stub mode**:

- Script generation simulates a 3-second delay and returns a hardcoded sample script
- Audio conversion simulates a 2.5-second delay and creates a placeholder database record

To switch to live mode:
1. Add `OPENAI_API_KEY=sk-...` to `.env`
2. Deploy the edge functions: `supabase functions deploy generate-script generate-audio`
3. The UI requires zero changes — it calls the same edge functions regardless

---

## Database Structure

| Table | Purpose |
|-------|---------|
| `profiles` | User name, age, gender, WhatsApp |
| `scripts` | Generated scripts (max 10 per user) |
| `audio_files` | TTS-generated audio metadata + storage path |
| `listening_sessions` | Each completed/stopped listen session with mood and action |

All tables have Row Level Security (RLS) — users can only read and write their own rows.

---

## Files Added in This Build

```
src/
├── pages/
│   └── Dashboard.tsx              ← Complete rewrite (tab shell)
└── components/
    └── dashboard/
        ├── HomeTab.tsx            ← Chat-like input + generation
        ├── ScriptsTab.tsx         ← Scripts list + expand/delete/convert
        ├── AudioTab.tsx           ← Audio player + loop + mood sheet
        ├── TrackerTab.tsx         ← Listening history + stats
        └── DailyThoughtModal.tsx  ← Daily wisdom modal

supabase/
└── functions/
    ├── generate-script/index.ts   ← GPT-4o script generation edge fn
    └── generate-audio/index.ts    ← OpenAI TTS + Storage upload edge fn
```

---

## What to Do Next

### Immediate (to go live with AI):
1. Get an OpenAI API key
2. Add it to Supabase: Dashboard → Settings → Edge Functions → Secrets → `OPENAI_API_KEY`
3. Create the storage bucket: Supabase Dashboard → Storage → New bucket → `audio-files` → Private
4. Deploy edge functions: `supabase functions deploy generate-script generate-audio`

### Next features to build:
- Onboarding goal-setting flow (`/onboarding`) with goal, deadline, and current situation
- Weekly AI-generated email summary (Sunday 8am cron)
- Push notifications for daily listening reminders
- Profile page stats (sessions, streak, longest streak)
- PWA manifest + service worker for installability

---

*"Whatever your mind can conceive and believe, it can achieve."*
*— Napoleon Hill*
