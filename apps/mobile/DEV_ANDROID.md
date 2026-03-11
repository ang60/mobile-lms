# Android: "Network request failed" to API

The app talks to your API at `http://10.0.2.2:3000` on the **Android emulator**. If you see "Network request failed", do the following.

## 1. Use a development build (required for HTTP)

**Expo Go** uses its own Android manifest and **ignores** your `usesCleartextTraffic` setting, so HTTP is blocked. You must run a **development build** so your app is built with cleartext allowed:

```bash
cd apps/mobile
npx expo run:android
```

This builds and installs the app on the emulator (or connected device) with your config. After that, reload the app and try again.

## 2. API must be running and reachable

- Start the API (from repo root): `npm run dev:api`
- On your **computer**, check: open `http://localhost:3000/content` in a browser; you should get JSON.
- API must listen on **all interfaces** (`HOST=0.0.0.0` in `apps/api/.env`).

## 3. Optional: use your machine’s IP

If `10.0.2.2` still fails (e.g. on a physical device), set your computer’s LAN IP in `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
```

Replace with your actual IP (same Wi‑Fi as the device). Then rebuild/restart the app.
