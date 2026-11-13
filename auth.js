// ==========================================
// 1. KONFIGURASI FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCFrS9L0YFDB29-n50vC2EkVFKclW2wRTk",
    authDomain: "hafar-web.firebaseapp.com",
    projectId: "hafar-web",
    storageBucket: "hafar-web.firebasestorage.app",
    messagingSenderId: "887471904367",
    appId: "1:887471904367:web:cd859c0c01c65d7bbf9f9a",
    measurementId: "G-V16SW1J8L8"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Simpan sesi login secara lokal
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let currentUser = null;

// ==========================================
// 2. FUNGSI MENU SIDEBAR (AGAR TOMBOL MENU BISA DIKLIK)
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay') || document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
        // Fallback jika memakai style display/transform langsung
        if (sidebar.style.left === '0px') {
            sidebar.style.left = '-280px';
        } else if (sidebar.style.left === '-280px' || !sidebar.classList.contains('active')) {
            sidebar.style.left = '0px';
        }
    }
    if (overlay) {
        overlay.classList.toggle('active');
        overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
    }
}

// ==========================================
// 3. PANTAU STATUS LOGIN PENGGUNA
// ==========================================
auth.onAuthStateChanged((user) => {
    currentUser = user;
    const loggedOutBox = document.getElementById('sidebar-logged-out');
    const loggedInBox = document.getElementById('sidebar-logged-in');
    const userEmailDisplay = document.getElementById('user-email-display');

    if (user) {
        if (loggedOutBox) loggedOutBox.style.display = 'none';
        if (loggedInBox) loggedInBox.style.display = 'block';
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
    } else {
        if (loggedOutBox) loggedOutBox.style.display = 'block';
        if (loggedInBox) loggedInBox.style.display = 'none';
        if (userEmailDisplay) userEmailDisplay.textContent = '';
    }
});

// ==========================================
// 4. KONTROL MODAL LOGIN & SIGN UP
// ==========================================
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    showAuthMessage('', false);
}

function switchAuthTab(mode) {
    const title = document.getElementById('modal-main-title');
    const subtitle = document.getElementById('modal-main-subtitle');
    const extraFields = document.getElementById('signup-extra-fields');
    const loginBtn = document.getElementById('login-action-btn');
    const signupBtn = document.getElementById('signup-action-btn');
    const switchToSignup = document.getElementById('switch-to-signup-text');
    const switchToLogin = document.getElementById('switch-to-login-text');

    showAuthMessage('', false);

    if (mode === 'signup') {
        if (title) title.textContent = "DAFTAR ANGGOTA BARU";
        if (subtitle) subtitle.textContent = "Buat akun untuk mulai berkontribusi di HAFAR'S";
        if (extraFields) extraFields.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'block';
        if (switchToSignup) switchToSignup.style.display = 'none';
        if (switchToLogin) switchToLogin.style.display = 'block';
    } else {
        if (title) title.textContent = "AKUN ANGGOTA";
        if (subtitle) subtitle.textContent = "Masuk untuk mengelola konten galeri";
        if (extraFields) extraFields.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'none';
        if (switchToSignup) switchToSignup.style.display = 'block';
        if (switchToLogin) switchToLogin.style.display = 'none';
    }
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        if (icon) icon.textContent = "🙈";
    } else {
        input.type = "password";
        if (icon) icon.textContent = "👁️";
    }
}

function showAuthMessage(msg, isError = true) {
    const msgBox = document.getElementById('auth-status-msg');
    if (msgBox) {
        msgBox.textContent = msg;
        msgBox.style.color = isError ? '#ff6b6b' : '#51cf66';
        msgBox.style.display = msg ? 'block' : 'none';
    } else if (msg) {
        alert(msg);
    }
}

// ==========================================
// 5. AKSI LOGIN, SIGN UP, GOOGLE & LOGOUT
// ==========================================
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthMessage("Email dan password wajib diisi!");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            closeLoginModal();
        })
        .catch((error) => {
            showAuthMessage("Gagal masuk: " + error.message);
        });
}

function signUp() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const confirmPassword = document.getElementById('login-password-confirm').value;

    if (!email || !password) {
        showAuthMessage("Email dan password wajib diisi!");
        return;
    }
    if (password !== confirmPassword) {
        showAuthMessage("Konfirmasi password tidak cocok!");
        return;
    }
    if (password.length < 6) {
        showAuthMessage("Password minimal 6 karakter!");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.sendEmailVerification().then(() => {
                alert("Pendaftaran berhasil! Cek email " + email + " untuk verifikasi.");
                closeLoginModal();
            });
        })
        .catch((error) => {
            showAuthMessage("Gagal mendaftar: " + error.message);
        });
}

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Login Google sukses:", result.user.email);
            closeLoginModal();
        })
        .catch((error) => {
            showAuthMessage("Gagal login Google: " + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            alert("Berhasil keluar dari akun.");
        })
        .catch((error) => {
            alert("Gagal keluar: " + error.message);
        });
}