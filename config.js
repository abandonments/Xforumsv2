import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBTZmr8e_Gk9ltVEdVPOhI8Od9bD3tbrdA",
  authDomain: "rebornforums.firebaseapp.com",
  projectId: "rebornforums",
  storageBucket: "rebornforums.firebasestorage.app",
  messagingSenderId: "499435360097",
  appId: "1:499435360097:web:c5c1fc54e4c37e784b7f20"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const $ = (s) => document.querySelector(s);

// Persistent Auth Listener for Navbar updates
onAuthStateChanged(auth, async (user) => {
    const userSection = $('#user-section');
    if (!userSection) return;

    if (user) {
        let role = "User";
        let avatar = `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random&color=fff`;
        
        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) {
                const data = userSnap.data();
                role = data.role || "User";
                if (data.avatarUrl) avatar = data.avatarUrl;
            }
        } catch (e) { console.error("Session fetch failed"); }

        userSection.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${avatar}" style="width: 24px; height: 24px; border: 1px solid var(--border); object-fit: cover;">
                <span class="welcome-text">Logged in: <strong>${user.displayName || user.email}</strong></span>
                <a href="profile.html" class="header-btn">Profile</a>
                ${role === 'Admin' ? '<a href="admin_dashboardusers.html" class="header-btn" style="color:#58a6ff">AdminCP</a>' : ''}
                <button id="logoutBtn" class="header-btn">Logout</button>
            </div>
        `;
        $('#logoutBtn').onclick = () => signOut(auth).then(() => location.href = 'index.html');
    } else {
        userSection.innerHTML = `
            <span class="welcome-text">Welcome, Guest!</span>
            <a href="login.html" class="header-btn">Login</a>
            <a href="signup.html" class="header-btn">Register</a>
        `;
    }
});
