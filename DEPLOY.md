# Deployment Guide to Firebase

Your application has been successfully refactored to use **Firebase** for backend (Realtime, Scalable) and Hosting.

## Prerequisites
1.  **Create a Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firestore**: In the sidebar, go to **Build -> Firestore Database** and click "Create Database". Start in **Test Mode** (or Production, but Test is easier for development).
3.  **Enable Authentication**: In **Build -> Authentication**, click "Get Started". (Optional, if you plan to use Firebase Auth later, currently we use a custom logical auth on top of Firestore).

## Step 1: Configure the App
Open `services/firebase.ts` in your code editor and replace the placeholder `firebaseConfig` with your actual project keys.
You can find these keys in **Project Settings -> General -> Your apps**.

## Step 2: Install CLI
Run the following in your terminal:
```bash
npm install -g firebase-tools
```

## Step 3: Login & Initialize
```bash
firebase login
firebase init
```
- Select **Hosting** and **Firestore** (optional, for rules).
- Select **Use an existing project** -> Choose the one you created.
- **Hosting Setup**:
  - What do you want to use as your public directory? `dist`
  - Configure as a single-page app (rewrite all urls to /index.html)? `Yes`
  - Set up automatic builds and deploys with GitHub? `No` (unless you want to)

## Step 4: Build & Deploy
```bash
npm run build
firebase deploy
```

## Step 5: Verification
Firebase will provide a Hosting URL (e.g., `https://your-project.web.app`). Open it and verify the app loads.
- Create a user/candidate to populate the Firestore database.
- Open the dashboard in a separate tab to verify Realtime updates work.
