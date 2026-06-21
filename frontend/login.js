const API_URL = 'http://localhost:3000';

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
let isLoginMode = true;

// Theme Toggle
function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
initTheme();
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'dark';
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        localStorage.theme = 'light';
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
});

// Toggle Auth Mode
document.getElementById('btn-toggle-mode').addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    document.getElementById('form-title').innerText = isLoginMode ? 'Welcome Back' : 'Create Account';
    document.getElementById('form-subtitle').innerText = isLoginMode ? 'Login to access your dashboard' : 'Sign up to start tracking compliance';
    document.getElementById('btn-text').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('toggle-text').innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById('btn-toggle-mode').innerText = isLoginMode ? 'Register here' : 'Login here';
    document.getElementById('error-msg').classList.add('hidden');
});

// Submit Form
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to onboarding (Page 2)
            window.location.href = 'onboarding.html';
        } else {
            errorMsg.innerText = data.error;
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.innerText = "Server error. Please ensure backend is running.";
        errorMsg.classList.remove('hidden');
    }
});
