const firebaseConfig = {
    apiKey: "AIzaSyCFrS9L0YFDB29-n5OvC2EkVFKclW2wRTK",
    authDomain: "hafar-web.firebaseapp.com",
    projectId: "hafar-web",
    storageBucket: "hafar-web.firebasestorage.app",
    messagingSenderId: "887471904367",
    appId: "1:887471904367:web:c5bb4694916a522dbf9f9a",
    measurementId: "G-Y5WWTJSFFK"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Menyimpan sesi agar user tidak perlu login ulang terus-menerus
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let currentUser = null;

// Pantau Status Auth Pengguna
auth.onAuthStateChanged(user => {
    currentUser = user;
    const loggedOutBox = document.getElementById('sidebar-logged-out');
    const loggedInBox = document.getElementById('sidebar-logged-in');
    const emailDisplay = document.getElementById('user-email-display');
    const uploadContainer = document.getElementById('upload-container');
    const uploadVideoSection = document.getElementById('upload-video-section');

    if (user) {
        if (loggedOutBox) loggedOutBox.style.display = 'none';
        if (loggedInBox) loggedInBox.style.display = 'block';
        if (emailDisplay) emailDisplay.innerText = user.email;
        if (uploadContainer) {
            uploadContainer.style.display = 'block';
            const dateInput = document.getElementById('photo-date-input');
            if (dateInput && !dateInput.value) dateInput.valueAsDate = new Date();
        }
        if (uploadVideoSection) {
            uploadVideoSection.style.display = 'block';
        }
    } else {
        if (loggedOutBox) loggedOutBox.style.display = 'block';
        if (loggedInBox) loggedInBox.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'none';
        if (uploadVideoSection) uploadVideoSection.style.display = 'none';
    }

    if (typeof loadPhotos === "function") {
        loadPhotos();
    }
    if (typeof loadVideos === "function") {
        loadVideos();
    }
});

// Fungsi Sign In (Masuk)
function login() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    if (!email || !pass) {
        if (errorMsg) errorMsg.innerText = "Harap isi email dan password!";
        return;
    }

    if (errorMsg) errorMsg.innerText = "";
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerText = "Memproses...";
    }

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            closeLoginModal();
            document.getElementById('login-email').value = "";
            document.getElementById('login-password').value = "";
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerText = "Masuk (Sign In)";
            }
        })
        .catch(err => {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerText = "Masuk (Sign In)";
            }
            if (errorMsg) errorMsg.innerText = "Login gagal! Periksa email/password.";
        });
}

// Fungsi Sign Up (Daftar Akun Baru)
function signUp() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const signupBtn = document.getElementById('signup-btn');

    if (!email || !pass) {
        if (errorMsg) errorMsg.innerText = "Harap isi email dan password untuk mendaftar!";
        return;
    }

    if (pass.length < 6) {
        if (errorMsg) errorMsg.innerText = "Password minimal 6 karakter!";
        return;
    }

    if (errorMsg) errorMsg.innerText = "";
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.innerText = "Mendaftarkan...";
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => {
            alert("Akun berhasil dibuat dan otomatis masuk!");
            closeLoginModal();
            document.getElementById('login-email').value = "";
            document.getElementById('login-password').value = "";
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.innerText = "Daftar Akun Baru (Sign Up)";
            }
        })
        .catch(err => {
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.innerText = "Daftar Akun Baru (Sign Up)";
            }
            if (errorMsg) errorMsg.innerText = "Pendaftaran gagal: " + err.message;
        });
}

// Fungsi Sign Out (Keluar)
function logout() { 
    auth.signOut().then(() => {
        alert("Berhasil keluar akun.");
    }); 
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar) sidebar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active");
}

function showLoginModal() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("active")) toggleSidebar();
    const modal = document.getElementById("login-modal");
    if (modal) {
        document.body.appendChild(modal);
        modal.style.display = "flex";
        document.body.classList.add("no-scroll");
        setTimeout(() => modal.classList.add("show"), 10);
    }
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            document.body.classList.remove("no-scroll");
            const errorMsg = document.getElementById('login-error');
            if (errorMsg) errorMsg.innerText = "";
        }, 200);
    }
}