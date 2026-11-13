const firebaseConfig = {
  apiKey: "AIzaSyCFrS9L0YFDB29-n5OvC2EkVFKclW2wRTk",
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

// Menyimpan sesi agar user tidak perlu login ulang terus-menerus
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

let currentUser = null;

// Pantau Status Auth Pengguna (Berlaku untuk semua halaman termasuk Latihan Soal TKA)
auth.onAuthStateChanged(user => {
    currentUser = user;
    const loggedOutBox = document.getElementById('sidebar-logged-out');
    const loggedInBox = document.getElementById('sidebar-logged-in');
    const emailDisplay = document.getElementById('user-email-display');
    const uploadContainer = document.getElementById('upload-container');
    const uploadVideoSection = document.getElementById('upload-video-section');
    
    // Elemen khusus halaman Latihan Soal TKA
    const inputNamaTKA = document.getElementById('inputNama');
    const inputKelasTKA = document.getElementById('inputKelas');

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

        // Otomatis isi email/nama pada form Latihan Soal TKA
        if (inputNamaTKA) {
            inputNamaTKA.value = user.email;
            inputNamaTKA.readOnly = true;
        }
        // Muat asal daerah/instansi tersimpan jika ada
        if (inputKelasTKA && !inputKelasTKA.value) {
            const savedAsal = localStorage.getItem('hafar_saved_asal_' + user.uid);
            if (savedAsal) {
                inputKelasTKA.value = savedAsal;
            }
        }
    } else {
        if (loggedOutBox) loggedOutBox.style.display = 'block';
        if (loggedInBox) loggedInBox.style.display = 'none';
        if (uploadContainer) uploadContainer.style.display = 'none';
        if (uploadVideoSection) uploadVideoSection.style.display = 'none';

        if (inputNamaTKA) {
            inputNamaTKA.value = "Tamu (Belum Login)";
            inputNamaTKA.readOnly = true;
        }
    }

    if (typeof loadPhotos === "function") loadPhotos();
    if (typeof loadVideos === "function") loadVideos();
});

// Fungsi Toggle Tampilan Form Masuk vs Daftar
function switchAuthMode(mode) {
    const signupExtra = document.getElementById('signup-extra-fields');
    const modalTitle = document.getElementById('modal-main-title');
    const modalSubtitle = document.getElementById('modal-main-subtitle');
    const btnLogin = document.getElementById('login-action-btn');
    const btnSignup = document.getElementById('signup-action-btn');
    const switchText = document.getElementById('switch-auth-text');
    const errorMsg = document.getElementById('login-error');
    
    if (errorMsg) errorMsg.innerText = "";

    if (mode === 'signup') {
        if (signupExtra) signupExtra.style.display = 'block';
        if (modalTitle) modalTitle.innerText = "DAFTAR AKUN BARU";
        if (modalSubtitle) modalSubtitle.innerText = "Buat akun kontributor baru HAFAR'S";
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnSignup) btnSignup.style.display = 'block';
        if (switchText) switchText.innerHTML = 'Sudah punya akun? <a href="javascript:void(0)" onclick="switchAuthMode(\'login\')" style="color: #38bdf8; text-decoration: underline;">Masuk di sini</a>';
    } else {
        if (signupExtra) signupExtra.style.display = 'none';
        if (modalTitle) modalTitle.innerText = "AKUN ANGGOTA";
        if (modalSubtitle) modalSubtitle.innerText = "Masuk untuk mengelola media HAFAR'S";
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnSignup) btnSignup.style.display = 'none';
        if (switchText) switchText.innerHTML = 'Belum punya akun? <a href="javascript:void(0)" onclick="switchAuthMode(\'signup\')" style="color: #38bdf8; text-decoration: underline;">Buat akun baru</a>';
    }
}

// Fungsi Toggle Show/Hide Password
function togglePasswordVisibility(inputId, iconId) {
    const inputField = document.getElementById(inputId);
    const iconElem = document.getElementById(iconId);
    if (!inputField) return;
    if (inputField.type === "password") {
        inputField.type = "text";
        if (iconElem) iconElem.innerText = "🙈";
    } else {
        inputField.type = "password";
        if (iconElem) iconElem.innerText = "👁️";
    }
}

// Fungsi Sign In (Masuk)
function login() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-action-btn');

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
        .then((userCredential) => {
            if (!userCredential.user.emailVerified) {
                alert("Perhatian: Email Anda belum diverifikasi. Silakan cek kotak masuk/spam email Anda untuk mengonfirmasi bahwa Anda benar-benar pemilik akun ini.");
            }
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
            if (errorMsg) errorMsg.innerText = "Login gagal: " + err.message;
        });
}

// Fungsi Sign Up (Daftar Akun Baru + Konfirmasi Password 2x + Kirim Email Verifikasi)
function signUp() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    const confirmPass = document.getElementById('login-password-confirm').value;
    const errorMsg = document.getElementById('login-error');
    const signupBtn = document.getElementById('signup-action-btn');

    if (!email || !pass || !confirmPass) {
        if (errorMsg) errorMsg.innerText = "Harap isi semua kolom termasuk konfirmasi password!";
        return;
    }

    if (pass !== confirmPass) {
        if (errorMsg) errorMsg.innerText = "Password dan ketik ulang password tidak cocok!";
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
        .then((userCredential) => {
            userCredential.user.sendEmailVerification().then(() => {
                alert("Akun berhasil dibuat! Kami telah mengirimkan email konfirmasi ke " + email + " untuk memastikan Anda benar-benar ingin masuk ke web ini. Silakan cek kotak masuk atau folder spam email Anda.");
                closeLoginModal();
                switchAuthMode('login');
                document.getElementById('login-email').value = "";
                document.getElementById('login-password').value = "";
                document.getElementById('login-password-confirm').value = "";
                if (signupBtn) {
                    signupBtn.disabled = false;
                    signupBtn.innerText = "Daftar Akun Baru (Sign Up)";
                }
            }).catch(() => {
                alert("Akun berhasil dibuat dan otomatis masuk!");
                closeLoginModal();
                if (signupBtn) {
                    signupBtn.disabled = false;
                    signupBtn.innerText = "Daftar Akun Baru (Sign Up)";
                }
            });
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
        switchAuthMode('login');
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