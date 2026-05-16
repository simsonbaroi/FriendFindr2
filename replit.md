# FriendFindr

A privacy-focused social discovery and reconnect mobile app built with Expo (React Native) and Firebase. Users can find people by name, username, or profession — without exposing private contact info like phone numbers or email addresses.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Expo app runs via the `artifacts/friendfindr: expo` workflow

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- Auth: Firebase Authentication (email/password)
- DB: Cloud Firestore
- Storage: Firebase Storage
- State: React Context (AuthContext) + React Query
- Fonts: Inter (400/500/600/700)

## Where things live

- `artifacts/friendfindr/` — Expo mobile app
  - `lib/firebase.ts` — Firebase app initialization
  - `context/AuthContext.tsx` — Auth state, login, signup, logout, profile
  - `services/userService.ts` — User search and profile CRUD
  - `services/requestService.ts` — Contact request send/approve/reject/cancel
  - `services/chatService.ts` — Real-time chat via Firestore listeners
  - `app/(tabs)/` — Main tab screens (home/search, requests, chats, profile)
  - `app/auth/` — Login, signup, forgot password
  - `app/profile/[uid].tsx` — View any user profile
  - `app/chat/[chatId].tsx` — Real-time chat screen
  - `constants/colors.ts` — Deep navy + cyan color palette (light + dark)

## Architecture decisions

- Firebase SDK used directly in the mobile app (no custom backend needed for MVP)
- Firestore document IDs for requests use `{fromUid}_{toUid}` format for easy lookup
- Chat IDs use sorted `{uid1}_{uid2}` so both participants share the same document
- Search is done client-side over visible profiles to avoid exposing hidden users
- Auth state drives routing — unauthenticated users land on login, authenticated on home

## Firebase Setup Required

In Firebase console, enable:
1. Authentication → Email/Password sign-in method
2. Firestore Database → Create in production or test mode
3. Storage → Create bucket

Firestore collections used: `users`, `requests`, `chats`, `messages`

## Product

- Search for people by name, username, or profession — only public info shown
- Send/receive/approve/reject connection requests
- Real-time text chat after both sides connect
- Privacy settings: toggle search visibility and whether to accept requests
- Profile editing: name, bio, country, profession, tags
- Dark mode supported throughout

## User preferences

- React Native + Expo (not Flutter)
- Firebase backend (Firestore, Auth, Storage)
- Beginner-friendly, modular, clean architecture
- No AI features, no calls, no media sharing in MVP

## Gotchas

- Firebase Realtime Database watcher bug in Metro: metro.config.js uses `blockList` to exclude temp dirs
- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- Expo apps: never run `npx expo start` directly, use the workflow

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
