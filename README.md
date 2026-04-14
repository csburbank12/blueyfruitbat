# Knowledge Fortress MVP Alpha — Firebase Edition

This repo now targets **Firebase** instead of Supabase.

## What changed
- Firebase Auth for teacher sign-in
- Firestore for question sets, sessions, and attempts
- Firebase Admin session cookies for server-rendered Next.js pages and protected API writes
- Firestore rules + index definitions in `/firebase`

## Backend shape
- `questionSets/{setId}`
- `questionSets/{setId}/questions/{questionId}`
- `sessions/{sessionId}`
- `attempts/{attemptId}`

Attempts store answer-level detail inline as an `answers` array. That keeps session results and teacher analytics simple for the MVP.

## Environment variables
Copy `.env.example` to `.env.local` and fill in:

### Firebase web SDK
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin SDK
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

For local development, keep the private key on one line in `.env.local` with `\n` escaped line breaks.

## Firebase setup
1. Create a Firebase project.
2. Enable **Authentication → Google**.
3. Create a **Cloud Firestore** database.
4. Deploy `firebase/firestore.rules`.
5. Create the indexes from `firebase/firestore.indexes.json` if Firestore prompts for them.
6. Add the `.env.local` values.

## Commands
```bash
npm install
npm run dev
```

## Important files
- `lib/firebase/client.ts` — web SDK bootstrap
- `lib/firebase/admin.ts` — Admin SDK bootstrap
- `lib/firebase/auth.ts` — session cookie verification for server code
- `app/api/auth/session/route.ts` — exchanges Firebase ID token for server session cookie
- `app/api/question-sets/route.ts` — save/update question sets in Firestore
- `app/api/sessions/route.ts` — launch a hosted session in Firestore
- `app/api/sessions/[sessionId]/attempts/route.ts` — save student attempts
- `lib/data/index.ts` — Firestore-backed reads used by pages and host views

## Current status
This is still an alpha. The hosted play flow, host room, join-by-code, results, and teacher analytics are now shaped around Firebase, but you should still run a real `npm install && npm run build` after adding your env vars.
