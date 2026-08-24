/* =========================================================
   NAVIGATION HELPERS
========================================================= */

function openAlphabet() {
    window.location.href = "alphabet.html";
}

function goHome() {
    window.location.href = "home.html";
}

function openLearn() {
    window.location.href = "learn.html";
}

function openPractice() {
    window.location.href = "practice.html";
}

function openProgress() {
    window.location.href = "progress.html";
}

function goAlphabet() {
    window.location.href = "alphabet.html";
}

function openLearnFromProgress() {
    window.location.href = "learn.html";
}

function openPracticeFromProgress() {
    window.location.href = "practice.html";
}

function logout() {
    auth.signOut().then(function () {
        window.location.href = "index.html";
    });
}


/* =========================================================
   LOGIN / SIGNUP (index.html only)
========================================================= */

const loginFormEl = document.getElementById("loginForm");
const signupFormEl = document.getElementById("signupForm");
const showSignupLink = document.getElementById("showSignup");
const showLoginLink = document.getElementById("showLogin");
const authErrorEl = document.getElementById("authError");

// index.html hai ya nahi, yeh flag guard logic mein use hoga
const isAuthPage = !!(loginFormEl || signupFormEl);

function showAuthError(message) {
    if (authErrorEl) {
        authErrorEl.textContent = message;
        authErrorEl.classList.remove("hidden");
    } else {
        alert(message);
    }
}

function clearAuthError() {
    if (authErrorEl) {
        authErrorEl.textContent = "";
        authErrorEl.classList.add("hidden");
    }
}

if (showSignupLink) {
    showSignupLink.addEventListener("click", function () {
        clearAuthError();
        document.getElementById("loginView").classList.add("hidden");
        document.getElementById("signupView").classList.remove("hidden");
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener("click", function () {
        clearAuthError();
        document.getElementById("signupView").classList.add("hidden");
        document.getElementById("loginView").classList.remove("hidden");
    });
}

if (loginFormEl) {
    loginFormEl.addEventListener("submit", function (event) {
        event.preventDefault();
        clearAuthError();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        auth.signInWithEmailAndPassword(email, password)
            .then(function () {
                window.location.href = "home.html";
            })
            .catch(function (error) {
                showAuthError(error.message);
            });
    });
}

if (signupFormEl) {
    signupFormEl.addEventListener("submit", function (event) {
        event.preventDefault();
        clearAuthError();

        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const confirmPassword =
            document.getElementById("signupConfirmPassword").value;

        if (password !== confirmPassword) {
            showAuthError("Passwords match nahi ho rahe.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                const user = userCredential.user;

                // Naya user document Firestore mein banao
                return db.collection("users").doc(user.uid).set({
                    name: name,
                    email: email,
                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),
                    learnedLetters: [],
                    currentLesson: 0,
                    currentPracticeIndex: 0,
                    questionsCompleted: 0
                });
            })
            .then(function () {
                window.location.href = "home.html";
            })
            .catch(function (error) {
                showAuthError(error.message);
            });
    });
}


/* =========================================================
   LESSON DATA
========================================================= */

const alphabetLessons = [

    {
        letter: "અ",
        name: "અ — A",
        description: 'This is the Gujarati letter "અ".',
        signDescription:
            "Observe the sign for અ carefully.",
        signMedia: "https://res.cloudinary.com/w6xk45pg/image/upload/v1787230404/a.png",
        audio: "audio/a.mp3",
        
    },

    {
        letter: "આ",
        name: "આ — Aa",
        description: 'This is the Gujarati letter "આ".',
        signDescription:
            "Observe the sign for આ carefully.",
        signMedia:"https://res.cloudinary.com/w6xk45pg/image/upload/v1787233882/aa.png",
        audio: "audio/aa.mp3"
    },

    {
        letter: "ઇ",
        name: "ઇ — I",
        description: 'This is the Gujarati letter "ઇ".',
        signDescription:
            "Observe the sign for ઇ carefully.",
        mediaType: "video",
        signMedia:"https://res.cloudinary.com/w6xk45pg/video/upload/v1787253935/Video_Project.mp4",
        audio: "audio/i.mp3"
    },

    {
        letter: "ઈ",
        name: "ઈ — Ee",
        description: 'This is the Gujarati letter "ઈ".',
        signDescription:
            "Observe the sign for ઈ carefully.",
        signMedia: null,
        audio: "audio/ee.mp3"
    },

    {
        letter: "ઉ",
        name: "ઉ — U",
        description: 'This is the Gujarati letter "ઉ".',
        signDescription:
            "Observe the sign for ઉ carefully.",
        signMedia: null,
        audio: "audio/u.mp3"
    }

];


/* =========================================================
   STATE — Firestore se load hoga (per logged-in user)
========================================================= */

let learnedLetters = [];
let currentLesson = 0;
let currentPracticeIndex = 0;
let questionsCompleted = 0;

let currentUser = null;
let userDocRef = null;


/* =========================================================
   AUTH GUARD — har protected page yahan se guzarta hai
========================================================= */

auth.onAuthStateChanged(function (user) {

    if (user) {

        currentUser = user;
        userDocRef = db.collection("users").doc(user.uid);

        if (isAuthPage) {
            // Already logged in, login/signup page pe rukne ki zaroorat nahi
            window.location.href = "home.html";
            return;
        }

        loadUserProgress();

    } else {

        if (!isAuthPage) {
            // Login nahi hai -> index.html (login page) pe bhej do
            window.location.href = "index.html";
        }

    }

});


/* =========================================================
   FIRESTORE — PROGRESS READ / WRITE
========================================================= */

function loadUserProgress() {

    userDocRef.get()
        .then(function (doc) {

            if (doc.exists) {

                const data = doc.data();

                learnedLetters = data.learnedLetters || [];
                currentLesson = data.currentLesson || 0;
                currentPracticeIndex =
                    data.currentPracticeIndex || 0;
                questionsCompleted =
                    data.questionsCompleted || 0;

            }

            initCurrentPage();

        })
        .catch(function (error) {

            console.error("Error loading progress:", error);
            initCurrentPage();

        });

}

function saveUserProgress(fields) {

    if (!userDocRef) return;

    userDocRef.set(fields, { merge: true })
        .catch(function (error) {
            console.error("Error saving progress:", error);
        });

}

function initCurrentPage() {

    if (document.getElementById("currentLetter")) {
        updateLesson();
    }

    if (document.getElementById("letterProgressList")) {
        loadProgressPage();
    }

    if (document.getElementById("practiceLetter")) {
        initPractice();
    }

    updateOverallProgressDisplays();

}

function updateOverallProgressDisplays() {

    const total = alphabetLessons.length;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (learnedLetters.length / total) * 100
            );

    const homeContinuePercent =
        document.getElementById("homeContinuePercent");

    if (homeContinuePercent) {
        homeContinuePercent.textContent = `${percentage}%`;
    }

    const homeOverallPercent =
        document.getElementById("homeOverallPercent");

    if (homeOverallPercent) {
        homeOverallPercent.textContent = `${percentage}%`;
    }

    const alphabetPercentText =
        document.getElementById("alphabetPercentText");

    if (alphabetPercentText) {
        alphabetPercentText.textContent = `${percentage}% Complete`;
    }

    const alphabetProgressFill =
        document.getElementById("alphabetProgressFill");

    if (alphabetProgressFill) {
        alphabetProgressFill.style.width = `${percentage}%`;
    }

}


/* =========================================================
   LEARN PAGE
========================================================= */

function updateLesson() {

    const lesson = alphabetLessons[currentLesson];

    document.getElementById("currentLetter")
        .textContent = lesson.letter;

    document.getElementById("letterName")
        .textContent = lesson.name;

    document.getElementById("letterDescription")
        .textContent = lesson.description;

    document.getElementById("signTitle")
        .textContent = "Sign for " + lesson.letter;

    document.getElementById("signDescription")
        .textContent = lesson.signDescription;

    const signMedia = document.getElementById("signMedia");

    if (lesson.signMedia) {

    if (lesson.mediaType === "video") {

        signMedia.innerHTML = `
            <video
                class="sign-video"
                controls
                autoplay
                muted
                loop
                playsinline
            >
                <source src="${lesson.signMedia}" type="video/mp4">
                Your browser does not support video.
            </video>
        `;

    } else {

        signMedia.innerHTML = `
            <img
                src="${lesson.signMedia}"
                alt="Sign for ${lesson.letter}"
                class="sign-image"
            >
        `;

    }

} else {

    signMedia.innerHTML = `
        <div class="sign-icon">
            ✋
        </div>

        <p>
            Sign demonstration
            will appear here
        </p>
    `;

}

    const lessonNumber = currentLesson + 1;

    const percentage =
        Math.round(
            (lessonNumber / alphabetLessons.length) * 100
        );

    document.getElementById("letterCounter")
        .textContent =
        `Letter ${lessonNumber} of ${alphabetLessons.length}`;

    document.getElementById("lessonPercentage")
        .textContent = `${percentage}%`;

    document.querySelector(".progress-fill")
        .style.width = `${percentage}%`;

}

function playLetter() {

    const lesson = alphabetLessons[currentLesson];

    if (lesson.audio) {

        const player = new Audio(lesson.audio);

        player.play().catch(function () {
            alert(
                `Audio file "${lesson.audio}" nahi mili. ` +
                `Check karo ki yeh file "audio" folder mein maujood hai.`
            );
        });

    } else {

        alert(`Audio for ${lesson.letter} will play here.`);

    }

}

function markLearned() {

    const lesson = alphabetLessons[currentLesson];

    if (!learnedLetters.includes(lesson.letter)) {

        learnedLetters.push(lesson.letter);

        saveUserProgress({ learnedLetters: learnedLetters });

    }

    alert(`${lesson.letter} marked as learned!`);

}

function nextLetter() {

    if (currentLesson < alphabetLessons.length - 1) {

        currentLesson++;

        saveUserProgress({ currentLesson: currentLesson });

        updateLesson();

    } else {

        alert("🎉 Gujarati Alphabet lesson complete!");

    }

}


/* =========================================================
   PRACTICE PAGE
========================================================= */

function initPractice() {
    updatePracticeQuestion();
}

function updatePracticeQuestion() {

    const lesson = alphabetLessons[currentPracticeIndex];

    document.getElementById("practiceLetter")
        .textContent = lesson.letter;

    document.getElementById("practiceInstruction")
        .textContent =
        `Perform the sign you learned for ${lesson.letter}.`;

    const qNumber = currentPracticeIndex + 1;

    const percentage =
        Math.round(
            (qNumber / alphabetLessons.length) * 100
        );

    document.getElementById("practiceCounter")
        .textContent =
        `Question ${qNumber} of ${alphabetLessons.length}`;

    document.getElementById("practicePercentage")
        .textContent = `${percentage}%`;

    document.getElementById("practiceProgressFill")
        .style.width = `${percentage}%`;

    document.getElementById("practiceResult")
        .classList.add("hidden");

    document.getElementById("checkButton")
        .classList.remove("hidden");

    document.getElementById("nextPracticeButton")
        .classList.add("hidden");

}

function startPracticeCamera() {

    alert(
        "Camera access yahan implement hoga (sign recognition abhi coming soon hai)."
    );

}

function checkPracticeSign() {

    // NOTE: Real sign-recognition model abhi integrate nahi hai,
    // isliye yahan har attempt ko "correct" maan kar result save
    // kar rahe hain. Jab recognition model ready ho, is function
    // ke andar us check ka result yahan use karo.

    const resultSection = document.getElementById("practiceResult");
    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");

    resultSection.classList.remove("hidden");
    resultIcon.textContent = "✓";
    resultTitle.textContent = "Correct!";
    resultMessage.textContent = "Great job! Sign recorded.";

    document.getElementById("checkButton")
        .classList.add("hidden");

    document.getElementById("nextPracticeButton")
        .classList.remove("hidden");

    questionsCompleted++;

    saveUserProgress({ questionsCompleted: questionsCompleted });

}

function nextPracticeQuestion() {

    if (currentPracticeIndex < alphabetLessons.length - 1) {

        currentPracticeIndex++;

        saveUserProgress({
            currentPracticeIndex: currentPracticeIndex
        });

        updatePracticeQuestion();

    } else {

        alert("🎉 Practice complete!");

        currentPracticeIndex = 0;

        saveUserProgress({ currentPracticeIndex: 0 });

        updatePracticeQuestion();

    }

}


/* =========================================================
   PROGRESS PAGE
========================================================= */

function loadProgressPage() {

    const letters = alphabetLessons || [];
    const learned = learnedLetters || [];

    const total = letters.length;
    const learnedCount = learned.length;

    const percentage =
        total === 0
            ? 0
            : Math.round((learnedCount / total) * 100);

    /* Overall percentage */

    const percentageElement =
        document.getElementById("overallPercentage");

    if (percentageElement) {
        percentageElement.textContent = `${percentage}%`;
    }

    /* Learned count */

    const countElement =
        document.getElementById("learnedCount");

    if (countElement) {
        countElement.textContent = `${learnedCount} / ${total}`;
    }

    /* Progress bar */

    const progressFill =
        document.getElementById("overallProgressFill");

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    /* Letter list */

    const list =
        document.getElementById("letterProgressList");

    if (list) {

        list.innerHTML = "";

        letters.forEach(function (lesson) {

            const isLearned =
                learned.includes(lesson.letter);

            const card = document.createElement("div");

            card.className = "letter-progress-card";

            card.innerHTML = `

                <div class="progress-letter">
                    ${lesson.letter}
                </div>

                <div class="progress-status">
                    ${
                        isLearned
                            ? "✓ Learned"
                            : "○ Not Learned"
                    }
                </div>

            `;

            list.appendChild(card);

        });

    }

    /* Practice count */

    const practiceCount =
        document.getElementById("questionsCompleted");

    if (practiceCount) {
        practiceCount.textContent =
            `${questionsCompleted} / ${total}`;
    }

    const practiceLearned =
        document.getElementById("practiceLearnedCount");

    if (practiceLearned) {
        practiceLearned.textContent = learnedCount;
    }

}




