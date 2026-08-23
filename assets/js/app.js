/**
 * NEXUS AUTHENTICATION & INTERACTIVE SYSTEM
 * Handles motivational quote rotation, form effects, modals, and login transitions.
 */

// Motivational Quotes Database
const motivationalQuotes = [
  {
    quote: "The secret of getting ahead is getting started. The complex is made simple one step at a time.",
    author: "Mark Twain",
    heading: "Unlock Your <span>Potential</span>"
  },
  {
    quote: "Believe you can and you're halfway there. Great achievements always begin with a decision to try.",
    author: "Theodore Roosevelt",
    heading: "Inspire Your <span>Journey</span>"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    heading: "Fuel Your <span>Ambition</span>"
  },
  {
    quote: "Your time is limited, so don't waste it living someone else's life. Innovation distinguishes a leader.",
    author: "Steve Jobs",
    heading: "Lead with <span>Innovation</span>"
  },
  {
    quote: "Opportunities don't happen, you create them. Keep your eyes on the stars and your feet on the ground.",
    author: "Chris Grosser",
    heading: "Shape Your <span>Future</span>"
  }
];

let currentQuoteIndex = 0;
let quoteAutoRotateTimer = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initQuotes();
  initInputEffects();
  initPasswordToggle();
  initModals();
  initFormSubmission();
});

/* --------------------------------------------------------------------------
   1. MOTIVATIONAL QUOTES CONTROLLER
   -------------------------------------------------------------------------- */
function initQuotes() {
  const quoteHeading = document.getElementById('quoteHeading');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const refreshBtn = document.getElementById('btnRefreshQuote');

  function renderQuote(index, animated = true) {
    const data = motivationalQuotes[index];
    if (!quoteText || !quoteHeading || !quoteAuthor) return;

    if (animated) {
      quoteText.classList.add('fade-out');
      setTimeout(() => {
        quoteHeading.innerHTML = data.heading;
        quoteText.textContent = `"${data.quote}"`;
        quoteAuthor.textContent = data.author;
        quoteText.classList.remove('fade-out');
        quoteText.classList.add('fade-in');
      }, 300);
    } else {
      quoteHeading.innerHTML = data.heading;
      quoteText.textContent = `"${data.quote}"`;
      quoteAuthor.textContent = data.author;
    }
  }

  function nextQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % motivationalQuotes.length;
    renderQuote(currentQuoteIndex);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      clearInterval(quoteAutoRotateTimer);
      nextQuote();
      showToast('Motivational quote updated!');
      startAutoRotate();
    });
  }

  function startAutoRotate() {
    clearInterval(quoteAutoRotateTimer);
    quoteAutoRotateTimer = setInterval(nextQuote, 10000);
  }

  // Initial render
  renderQuote(currentQuoteIndex, false);
  startAutoRotate();
}

/* --------------------------------------------------------------------------
   2. INPUT FOCUS & INTERACTION EFFECTS
   -------------------------------------------------------------------------- */
function initInputEffects() {
  const inputWraps = document.querySelectorAll('.input-field-wrap');

  inputWraps.forEach(wrap => {
    const input = wrap.querySelector('.auth-input');
    if (!input) return;

    input.addEventListener('focus', () => {
      wrap.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      wrap.classList.remove('focused');
    });
  });
}

/* --------------------------------------------------------------------------
   3. PASSWORD VISIBILITY TOGGLE
   -------------------------------------------------------------------------- */
function initPasswordToggle() {
  const toggleBtn = document.getElementById('btnTogglePassword');
  const pwdInput = document.getElementById('passwordInput');

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = pwdInput.getAttribute('type') === 'password';
      pwdInput.setAttribute('type', isPassword ? 'text' : 'password');

      // Update icon SVG
      toggleBtn.innerHTML = isPassword ? `
        <!-- Eye Open Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ` : `
        <!-- Eye Off Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
      `;

      toggleBtn.setAttribute('data-tooltip', isPassword ? 'Hide Password' : 'Show Password');
    });
  }
}

/* --------------------------------------------------------------------------
   4. MODALS CONTROLLER (Forgot Password & Register)
   -------------------------------------------------------------------------- */
function initModals() {
  const btnForgotPwd = document.getElementById('btnForgotPassword');
  const btnPwdKeyForgot = document.getElementById('btnPwdKeyForgot');
  const btnRegister = document.getElementById('btnRegister');
  const btnReadMore = document.getElementById('btnReadMore');

  const modalForgotPwd = document.getElementById('modalForgotPassword');
  const modalRegister = document.getElementById('modalRegister');
  const modalAbout = document.getElementById('modalAbout');

  const closeButtons = document.querySelectorAll('.modal-close-btn');
  const overlays = document.querySelectorAll('.modal-overlay');

  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal() {
    overlays.forEach(o => o.classList.remove('active'));
  }

  if (btnForgotPwd) {
    btnForgotPwd.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalForgotPwd);
    });
  }

  if (btnPwdKeyForgot) {
    btnPwdKeyForgot.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalForgotPwd);
    });
  }

  if (btnRegister) {
    btnRegister.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalRegister);
    });
  }

  if (btnReadMore) {
    btnReadMore.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalAbout);
    });
  }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Modal forms
  const forgotForm = document.getElementById('forgotPwdForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      showToast('Password reset link sent to your email!');
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      showToast('Account created successfully! You can now log in.');
    });
  }
}

/* --------------------------------------------------------------------------
   5. FORM SUBMISSION & NAVIGATION
   -------------------------------------------------------------------------- */
function initFormSubmission() {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!username) {
        showToast('Please enter your username or email', 'warning');
        usernameInput.focus();
        return;
      }

      if (!password) {
        showToast('Please enter your password', 'warning');
        passwordInput.focus();
        return;
      }

      // Simulate authentication
      showToast('Authenticating with Nexus...', 'info');
      
      // Store simulated user session
      sessionStorage.setItem('nexus_user', username);

      setTimeout(() => {
        window.location.href = 'home.html?module=worklist&view=payment';
      }, 1000);
    });
  }
}

/* --------------------------------------------------------------------------
   6. TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function showToast(message, type = 'success') {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
