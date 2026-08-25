const firebaseConfig = {
    apiKey: "AIzaSyCFrS9L0YFDB29-n5OvC2EkVFKclW2wRTk",
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

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let currentUser = null;

// Pantau Status Auth Pengguna
auth.onAuthStateChanged(user => {
    currentUser = user;
    const loggedOutBox = document.getElementById('sidebar-logged-out');
    const loggedInBox = document.getElementById('sidebar-logged-in');
    const emailDisplay = document.getElementById('user-email-display');
    const uploadContainer = document.getElementById('upload-container');

    if (user) {
        if (loggedOutBox) loggedOutBox.style.display = 'none';
        if (loggedInBox) loggedInBox.style.display = 'block';
        if (emailDisplay) emailDisplay.innerText = user.email;
        if (uploadContainer) {
            uploadContainer.style.display = 'block';
            const dateInput = document.getElementById('photo-date');
            if (dateInput) dateInput.valueAsDate = new Date();
        }
    } else {
        if (loggedOutBox) loggedOutBox.style.display = 'block';
        if (loggedInBox) loggedInBox.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'none';
    }

    if (typeof loadPhotos === "function") {
        loadPhotos();
    }
});

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
                loginBtn.innerText = "Masuk";
            }
        })
        .catch(err => {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerText = "Masuk";
            }
            if (errorMsg) errorMsg.innerText = "Login gagal! Periksa email/password.";
        });
}

function logout() { 
    auth.signOut(); 
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function showLoginModal() {
    if (document.getElementById("sidebar").classList.contains("active")) toggleSidebar();
    const modal = document.getElementById("login-modal");
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
        const errorMsg = document.getElementById('login-error');
        if (errorMsg) errorMsg.innerText = "";
    }, 300);
}