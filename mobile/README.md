# MUSCLE UP — Android / Play Store Mobile App

This directory contains the **React Native (Expo)** Play Store version of the MUSCLE UP Integrated Fitness & Resource Management System.

It mirrors every feature of the existing web app and connects to the same backend API.

---

## Project Structure

```
mobile/
├── App.js                        # Root component
├── app.json                      # Expo config (bundle ID, Play Store metadata)
├── eas.json                      # EAS Build profiles (preview APK, production AAB)
├── package.json
├── babel.config.js
├── assets/                       # App icons and splash screen
└── src/
    ├── firebase.js               # Firebase SDK initialisation
    ├── context/
    │   ├── AuthContext.js        # Auth state (AsyncStorage-backed)
    │   └── ToastContext.js       # In-app toast notifications
    ├── navigation/
    │   └── AppNavigator.js       # React Navigation stack + bottom tabs
    ├── screens/
    │   ├── LandingScreen.js
    │   ├── AuthScreen.js         # Sign in / Register / Password reset
    │   ├── MemberDashboardScreen.js
    │   ├── TrainerDashboardScreen.js
    │   ├── AdminDashboardScreen.js
    │   ├── ProfileScreen.js
    │   └── ScheduleScreen.js
    └── utils/
        ├── api.js                # fetchApi() — talks to the Express backend
        └── storage.js            # AsyncStorage helpers
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Expo CLI | ≥ 5 (`npm i -g expo-cli`) |
| EAS CLI | ≥ 10 (`npm i -g eas-cli`) |
| Android Studio / emulator | For local testing |

---

## Quick Start (local development)

```bash
cd mobile
npm install
npm start          # Opens Expo DevTools
npm run android    # Launch on Android emulator
```

### Configure the backend URL

Edit `app.json` → `extra.apiBaseUrl`:

```json
"extra": {
  "apiBaseUrl": "http://10.0.2.2:3000/api"
}
```

> **10.0.2.2** is the Android emulator's alias for your host machine's `localhost`.  
> Use your machine's LAN IP (e.g. `192.168.1.100`) for a physical device.  
> Use your production URL for production builds.

### Configure Firebase (optional)

The app falls back to classic email/password auth if Firebase is not configured.  
To enable Firebase, fill in the values in `app.json` → `extra`:

```json
"firebaseApiKey": "AIza...",
"firebaseAuthDomain": "your-app.firebaseapp.com",
"firebaseProjectId": "your-app",
"firebaseStorageBucket": "your-app.appspot.com",
"firebaseMessagingSenderId": "123456789",
"firebaseAppId": "1:123:android:abc"
```

You also need to download `google-services.json` from the Firebase console and place it at `mobile/google-services.json`.

---

## Building for the Play Store

### 1. Install & log in to EAS

```bash
npm install -g eas-cli
eas login
eas init        # Links the project to your EAS account
```

### 2. Build a preview APK (for internal testing)

```bash
npm run build:android:preview
# or: eas build --platform android --profile preview
```

EAS will produce a shareable `.apk` you can install directly on any Android device.

### 3. Build a production App Bundle (.aab)

```bash
npm run build:android
# or: eas build --platform android --profile production
```

The `.aab` file is what Google Play requires for all new submissions.

### 4. Submit to Google Play

1. Create your app in the [Google Play Console](https://play.google.com/console).
2. Set up a **Service Account** with the *Release Manager* role and download the JSON key.
3. Place the key at `mobile/google-play-service-account.json` (already listed in `.gitignore`).
4. Run:

```bash
npm run submit:android
# or: eas submit --platform android
```

EAS will upload the latest production build to Google Play's internal track.  
Promote it to production from the Play Console once reviewed.

---

## Environment Variables via EAS Secrets

Never commit secrets to source control. Use EAS Secrets for production builds:

```bash
eas secret:create --scope project --name FIREBASE_API_KEY --value "AIza..."
eas secret:create --scope project --name API_BASE_URL --value "https://api.muscleup.app/api"
```

Then reference them in `app.config.js` (create this file alongside `app.json`):

```js
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://10.0.2.2:3000/api',
    firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
  },
});
```

---

## App Features

| Feature | Member | Trainer | Admin |
|---------|--------|---------|-------|
| Dashboard overview | ✅ | ✅ | ✅ |
| Session scheduling | ✅ book | ✅ manage | ✅ manage |
| Workout plans | view | create/assign | — |
| Progress tracking | view | record | — |
| Programme enrolment | ✅ | — | — |
| User management | — | — | ✅ |
| Equipment management | — | — | ✅ |
| Profile editing | ✅ | ✅ | ✅ |
| Password reset (Firebase) | ✅ | ✅ | ✅ |
