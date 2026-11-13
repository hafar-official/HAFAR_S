// Konfigurasi Firebase Web App Terbaru
const firebaseConfig = {
    apiKey: "AIzaSyCFrS9L0YFDB29-n50vC2EkVFKclW2wRTk",
    authDomain: "hafar-web.firebaseapp.com",
    projectId: "hafar-web",
    storageBucket: "hafar-web.firebasestorage.app",
    messagingSenderId: "887471904367",
    appId: "1:887471904367:web:cd859c0c01c65d7bbf9f9a",
    measurementId: "G-V16SW1J8L8"
};[cite: 5]

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}[cite: 5]

const auth = firebase.auth();[cite: 5]
const db = firebase.firestore();[cite: 5]

// Menyimpan sesi agar user tidak perlu login ulang terus-menerus
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);[cite: 5]

let currentUser = null;[cite: 5]
let isSignUpMode = false;

// Pantau Status Auth Pengguna di Seluruh Halaman
auth.onAuthStateChanged((user) => {
    currentUser = user;[cite: 5]
    const loggedOutBox = document.getElementById('sidebar-logged-out');[cite: 5]
    const loggedInBox = document.getElementById('sidebar-logged-in');[cite: 5]
    const userEmailDisplay = document.getElementById('user-email-display');

    if (user) {
        // Jika user berhasil login (baik via Email/Password maupun Google)
        if (loggedOutBox) loggedOutBox.style.display = 'none';
        if (loggedInBox) loggedInBox.style.display = 'block';
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
    } else {
        // Jika user belum login / sudah logout
        if (loggedOutBox) loggedOutBox.style.display = 'block';
        if (loggedInBox) loggedInBox.style.display = 'none';
        if (userEmailDisplay) userEmailDisplay.textContent = '';
    }
});

// Buka & Tutup Modal Login
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    clearAuthError();
}

// Beralih antara Mode Masuk (Sign In) dan Daftar (Sign Up)
function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleLink = document.getElementById('auth-toggle-link');
    const confirmGroup = document.getElementById('confirm-password-group');

    clearAuthError();

    if (isSignUpMode) {
        if (title) title.textContent = "DAFTAR ANGGOTA BARU";
        if (submitBtn) submitBtn.textContent = "Daftar (Sign Up)";
        if (toggleText) toggleText.textContent = "Sudah punya akun?";
        if (toggleLink) toggleLink.textContent = "Masuk di sini";
        if (confirmGroup) confirmGroup.style.display = 'block';
    } else {
        if (title) title.textContent = "AKUN ANGGOTA";
        if (submitBtn) submitBtn.textContent = "Masuk (Sign In)";
        if (toggleText) toggleText.textContent = "Belum punya akun?";
        if (toggleLink) toggleLink.textContent = "Buat akun baru";
        if (confirmGroup) confirmGroup.style.display = 'none';
    }
}

// Fitur Lihat / Sembunyikan Password (Show/Hide)
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        if (iconElement) iconElement.textContent = "🙈";
    } else {
        input.type = "password";
        if (iconElement) iconElement.textContent = "👁️";
    }
}

// Tampilkan Pesan Error di Modal
function showAuthError(message) {
    const errorBox = document.getElementById('auth-error-msg');
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    } else {
        alert(message);
    }
}

function clearAuthError() {
    const errorBox = document.getElementById('auth-error-msg');
    if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
    }
}

// Proses Login atau Daftar dengan Email & Password
function handleAuthSubmit(event) {
    if (event) event.preventDefault();
    clearAuthError();

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthError("Email dan kata sandi wajib diisi.");
        return;
    }

    if (isSignUpMode) {
        // Mode Pendaftaran Baru (Sign Up)
        const confirmPassword = document.getElementById('auth-confirm-password').value;
        if (password !== confirmPassword) {
            showAuthError("Konfirmasi kata sandi tidak cocok!");
            return;
        }
        if (password.length < 6) {
            showAuthError("Kata sandi minimal 6 karakter.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Kirim email verifikasi otomatis
                return userCredential.user.sendEmailVerification().then(() => {
                    alert("Pendaftaran berhasil! Tautan verifikasi telah dikirim ke " + email + ". Silakan periksa kotak masuk atau folder spam.");
                    closeLoginModal();
                });
            })
            .catch((error) => {
                showAuthError("Pendaftaran gagal: " + error.message);
            });
    } else {
        // Mode Masuk (Sign In)
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Cek apakah email sudah diverifikasi
                if (!user.emailVerified) {
                    alert("Email Anda belum diverifikasi. Silakan klik tautan verifikasi di email Anda (atau verifikasi melalui Firebase Console).");
                }
                closeLoginModal();
            })
            .catch((error) => {
                showAuthError("Login gagal: " + error.message);
            });
    }
}

// Fungsi Login dengan Google
function loginWithGoogle() {
    clearAuthError();
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Login Google berhasil:", result.user.email);
            closeLoginModal();
        })
        .catch((error) => {
            showAuthError("Gagal login dengan Google: " + error.message);
        });
}

// Fungsi Keluar (Sign Out)
function logoutUser() {
    auth.signOut()
        .then(() => {
            alert("Anda telah keluar dari akun.");
        })
        .catch((error) => {
            alert("Gagal keluar: " + error.message);
        });
}