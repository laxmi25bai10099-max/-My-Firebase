# Firebase Backend Setup — Gujarati Sign Learning

Yeh guide batayegi ki apne 8 files wale app mein Firebase backend
(login/signup, Firestore data storage, page protection) kaise laga.

---

## 1. Firebase Project Banao

1. [console.firebase.google.com](https://console.firebase.google.com) kholo aur Google account se login karo.
2. **"Add project"** click karo → project ka naam do (e.g. `gujarati-sign-learning`) → **Continue**.
3. Google Analytics ka toggle off kar sakte ho (zaroori nahi hai) → **Create project**.

## 2. Authentication On Karo

1. Left sidebar mein **Build → Authentication** kholo.
2. **Get started** click karo.
3. **Sign-in method** tab mein **Email/Password** provider ko select karo → **Enable** → **Save**.

## 3. Firestore Database Banao

1. Left sidebar mein **Build → Firestore Database** kholo.
2. **Create database** click karo.
3. Location select karo (jo bhi aapke users ke closest ho, e.g. `asia-south1`).
4. **Start in test mode** select karo (abhi ke liye) → **Create**.
   - ⚠️ Test mode 30 din ke baad expire ho jaata hai — Step 6 mein diye gaye
     security rules zaroor lagana, chahe test mode mein ho ya na ho.

## 4. Web App Register Karo (Config Lene Ke Liye)

1. Project Overview page pe **`</>`** (Web) icon click karo.
2. App ka nickname do (e.g. `gujarati-web`) → **Register app**.
3. Jo `firebaseConfig` object dikhega, usse **copy** karo.
4. Apne project ki `firebase-config.js` file kholo aur `YOUR_API_KEY` jaisi
   saari placeholder values ko apni actual values se replace karo:

```js
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "gujarati-sign-learning.firebaseapp.com",
    projectId: "gujarati-sign-learning",
    storageBucket: "gujarati-sign-learning.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

## 5. Files Ka Structure

Ab total files yeh hain (8 original + 2 naye):

```
index.html          -> Login/Signup page
home.html            -> Protected (login required)
alphabet.html         -> Protected
learn.html            -> Protected
practice.html          -> Protected
progress.html          -> Protected
style.css
script.js            -> Saara app logic + Firebase Auth/Firestore integration
firebase-config.js    -> Naya file — Firebase project config + init (NAYA)
FIREBASE_SETUP_GUIDE.md -> Yeh guide (NAYA)
```

Har protected page mein `</body>` se pehle yeh order maintain hai — isse
mat badalna, order important hai:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>

<script src="firebase-config.js"></script>
<script src="script.js"></script>
```

## 6. Firestore Security Rules Lagao

Firestore → **Rules** tab kholo aur yeh rules paste karke **Publish** karo.
Isse ek user sirf apna hi data padh/likh payega, doosre ka nahi:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null
                          && request.auth.uid == userId;
    }

  }
}
```

## 7. Kya Kaam Kaise Karta Hai

- **Signup** (`index.html`): naya user `auth.createUserWithEmailAndPassword()`
  se banta hai, aur Firestore mein `users/{uid}` doc create hota hai
  (`learnedLetters: []`, `currentLesson: 0`, etc.).
- **Login**: `auth.signInWithEmailAndPassword()` se sign-in hota hai,
  fir `home.html` pe redirect.
- **Page protection**: `script.js` ke top mein ek `auth.onAuthStateChanged()`
  listener hai jo har protected page pe check karta hai — agar user
  logged in nahi hai to turant `index.html` pe bhej deta hai.
- **Progress save**: `markLearned()`, `nextLetter()`, `checkPracticeSign()`,
  `nextPracticeQuestion()` — inn sab mein `saveUserProgress()` call hota
  hai jo Firestore ke `users/{uid}` document ko `merge: true` ke saath
  update karta hai, taaki data kabhi overwrite na ho.
- **Progress load**: login hote hi `loadUserProgress()` Firestore se
  latest data (`learnedLetters`, `currentLesson`, `questionsCompleted`,
  etc.) fetch karta hai aur usi se saari pages (home, alphabet, learn,
  practice, progress) apna UI update karti hain.
- **Logout**: `logout()` function `auth.signOut()` call karke
  `index.html` pe wapas bhej deta hai.

## 8. Locally Test Kaise Karo

Firebase SDK `file://` se open karne pe theek se kaam nahi karta —
isliye ek local server chalao:

```bash
# Python se
python3 -m http.server 8000

# ya Node se (VS Code "Live Server" extension bhi chalega)
npx serve
```

Fir browser mein `http://localhost:8000` kholo.

## 9. (Optional) Firebase Hosting Pe Deploy

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # public directory: apne files wala folder
firebase deploy
```

---

Bas itna karne ke baad login, signup, page protection, aur Firestore
mein progress save/read — sab kaam karega.
