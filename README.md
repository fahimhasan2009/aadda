# Adda — Text Sharing Social Website

A responsive text-sharing community website built with HTML, CSS, Vanilla JavaScript, Firebase Authentication and Cloud Firestore.

## Included
- Email/password registration and login
- User profile basics
- Create text posts (up to 1000 characters)
- Live feed from Firestore
- Like/unlike posts
- Comments
- Delete your own posts
- Search posts and author names
- Save posts locally for the current browser session
- Recent/old sorting
- Dark mode toggle
- Responsive layout for mobile and desktop
- Firestore security rules

## Folder structure
```text
Adda/
├── index.html
├── style.css
├── firebase.js
├── app.js
├── firestore.rules
├── firebase.json
├── .firebaserc.example
├── .gitignore
└── README.md
```

## Setup (Android-friendly)

### 1. Create Firebase project
1. Open https://console.firebase.google.com/
2. Create a project named `Adda`.
3. Add a Web App and copy the Firebase configuration.
4. In **Authentication → Sign-in method**, enable **Email/Password**.
5. In **Firestore Database**, create a database.

### 2. Add Firebase config
Open `js/firebase.js` and replace all `YOUR_...` values with the exact values from Firebase Console → Project settings → Your apps → SDK setup and configuration.

### 3. Apply Firestore rules
Open Firebase Console → Firestore Database → Rules.
Copy the full content of `firestore.rules`, paste it into the Rules editor, then click **Publish**.

Do not use open rules such as `allow read, write: if true;`.

### 4. Run the website
Because this project uses JavaScript modules, do not open `index.html` directly as a local file. Use a local development server or deploy it to Firebase Hosting.

### 5. Deploy to Firebase Hosting
Install Firebase CLI on a computer with Node.js, then run these commands inside the `Adda` folder:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase init hosting
firebase deploy
```

During `firebase init hosting`:
- Choose the existing Adda Firebase project.
- Set public directory to `.` (a single dot).
- Configure as a single-page app: **No**.
- Do not overwrite `index.html`.

The `firebase.json` file is already included. Review the prompts carefully before confirming.

## Important notes
- Firebase web config is not a server password, but it must be protected by strong Firestore Security Rules and Authentication.
- Never publish service-account private keys or admin credentials.
- The current Saved Posts feature uses browser memory and is not synced between devices.
- Search currently filters the posts already loaded in the feed (up to 60 latest posts).
- This is a functional starter version. Before opening it to the public, add moderation/reporting, email verification, rate limits/App Check, pagination, and abuse prevention.
