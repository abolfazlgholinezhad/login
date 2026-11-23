/* ==========================================================================
   Ultra-Modern Authentication System Script
   Features: 3D Tilt, Particle Canvas, Confetti, Dynamic Validation, Test Auth
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const authCard = document.getElementById('authCard');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const tabIndicator = document.getElementById('tabIndicator');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const formsContainer = document.getElementById('formsContainer');
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const quickFillBtn = document.getElementById('quickFillBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Forgot Password Modal Elements
  const forgotLink = document.getElementById('forgotLink');
  const forgotModal = document.getElementById('forgotModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const forgotForm = document.getElementById('forgotForm');

  // Register Password Strength Elements
  const regPasswordInput = document.getElementById('regPassword');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }

  function applyTheme(theme, showNotification = true) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      if (showNotification) showToast('حالت روز فعال شد ☀️', 'info');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      if (showNotification) showToast('حالت شب فعال شد 🌙', 'info');
    }
  }

  // Initialize Particle Canvas Background
  initParticleCanvas();

  // Initialize 3D Tilt Effect on Card
  init3DTilt(authCard);

  // -------------------------------------------------------------------------
  // 1. Tab Switching (Login <-> Register)
  // -------------------------------------------------------------------------
  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  function switchTab(mode) {
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      // In RTL, 0% is right side
      tabIndicator.style.transform = 'translateX(0)';
      
      loginForm.classList.remove('hidden');
      loginForm.classList.add('active');
      registerForm.classList.add('hidden');
      registerForm.classList.remove('active');
    } else {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      // In RTL, moving left means negative translateX
      tabIndicator.style.transform = 'translateX(-100%)';
      
      registerForm.classList.remove('hidden');
      registerForm.classList.add('active');
      loginForm.classList.add('hidden');
      loginForm.classList.remove('active');
    }
  }

  // -------------------------------------------------------------------------
  // 2. Quick Fill Credentials (admin / admin)
  // -------------------------------------------------------------------------
  if (quickFillBtn) {
    quickFillBtn.addEventListener('click', () => {
      switchTab('login');
      const loginUser = document.getElementById('loginUser');
      const loginPass = document.getElementById('loginPass');
      
      loginUser.value = 'admin';
      loginPass.value = 'admin';
      
      // Visual focus feedback
      loginUser.focus();
      setTimeout(() => loginPass.focus(), 250);
      showToast('اطلاعات تستی (admin / admin) با موفقیت تکمیل شد!', 'info');
    });
  }

  // -------------------------------------------------------------------------
  // 3. Password Visibility Toggles
  // -------------------------------------------------------------------------
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = button.querySelector('svg');

      if (input.type === 'password') {
        input.type = 'text';
        // Eye-slash icon
        icon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      } else {
        input.type = 'password';
        // Eye icon
        icon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
    });
  });

  // -------------------------------------------------------------------------
  // 4. Password Strength Meter Calculation
  // -------------------------------------------------------------------------
  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
      let score = 0;

      if (!val) {
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
        return;
      }

      if (val.length >= 6) score++;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) || /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 2) {
        strengthBar.style.width = '30%';
        strengthBar.style.background = 'var(--danger)';
        strengthText.textContent = 'قدرت رمز: ضعیف ⚠️';
        strengthText.style.color = 'var(--danger)';
      } else if (score <= 4) {
        strengthBar.style.width = '70%';
        strengthBar.style.background = 'var(--warning)';
        strengthText.textContent = 'قدرت رمز: متوسط 🔒';
        strengthText.style.color = 'var(--warning)';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.background = 'var(--success)';
        strengthText.textContent = 'قدرت رمز: عالی و امن 🛡️';
        strengthText.style.color = 'var(--success)';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Login Submission with Test Authentication (admin / admin)
  // -------------------------------------------------------------------------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const submitBtn = loginForm.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    // UI Loading state
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      submitBtn.disabled = false;

      // Check for test admin credentials
      if (username.toLowerCase() === 'admin' && password === 'admin') {
        // Trigger celebratory confetti
        triggerConfetti();

        // Success Toast
        showToast('شما با موفقیت وارد شدید! خوش آمدید مدیر گرامی 🎉', 'success');

        // Transition from Form to Welcome Dashboard
        formsContainer.style.display = 'none';
        document.querySelector('.tabs-switcher').style.display = 'none';
        document.querySelector('.divider').style.display = 'none';
        document.querySelector('.social-buttons').style.display = 'none';
        document.querySelector('.quick-fill-badge').style.display = 'none';
        
        welcomeOverlay.classList.add('show');
      } else {
        // Shake card animation on failure
        authCard.classList.add('shake');
        setTimeout(() => authCard.classList.remove('shake'), 500);

        showToast('نام کاربری یا رمز عبور اشتباه است! (برای تست: admin / admin)', 'error');
      }
    }, 700);
  });

  // -------------------------------------------------------------------------
  // 6. Logout Action
  // -------------------------------------------------------------------------
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      welcomeOverlay.classList.remove('show');
      setTimeout(() => {
        formsContainer.style.display = 'block';
        document.querySelector('.tabs-switcher').style.display = 'flex';
        document.querySelector('.divider').style.display = 'flex';
        document.querySelector('.social-buttons').style.display = 'grid';
        document.querySelector('.quick-fill-badge').style.display = 'inline-flex';
        
        // Clear login inputs
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        switchTab('login');
        showToast('با موفقیت از حساب کاربری خارج شدید.', 'info');
      }, 200);
    });
  }

  // -------------------------------------------------------------------------
  // 7. Register Form Submission Simulation
  // -------------------------------------------------------------------------
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;
    const submitBtn = registerForm.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    if (pass !== confirmPass) {
      showToast('تکرار رمز عبور با رمز عبور اصلی مطابقت ندارد!', 'error');
      return;
    }

    btnText.style.display = 'none';
    spinner.style.display = 'block';
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      submitBtn.disabled = false;

      triggerConfetti();
      showToast(`ثبت‌نام شما با موفقیت انجام شد، ${name} عزیز!`, 'success');

      // Auto switch to login tab with prefilled user
      setTimeout(() => {
        switchTab('login');
        document.getElementById('loginUser').value = email;
        document.getElementById('loginPass').focus();
        showToast('اکنون می‌توانید وارد حساب کاربری خود شوید.', 'info');
      }, 1200);
    }, 900);
  });

  // -------------------------------------------------------------------------
  // 8. Forgot Password Modal Handler
  // -------------------------------------------------------------------------
  if (forgotLink && forgotModal && closeModalBtn) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('open');
    });

    closeModalBtn.addEventListener('click', () => {
      forgotModal.classList.remove('open');
    });

    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) {
        forgotModal.classList.remove('open');
      }
    });

    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      forgotModal.classList.remove('open');
      showToast(`لینک بازیابی رمز عبور با موفقیت به ${email} ارسال شد!`, 'success');
    });
  }

  // -------------------------------------------------------------------------
  // 9. Social Buttons Handler
  // -------------------------------------------------------------------------
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      showToast(`در حال اتصال امن به حساب ${provider}...`, 'info');
    });
  });

  // -------------------------------------------------------------------------
  // 10. Toast Notification Helper
  // -------------------------------------------------------------------------
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  // -------------------------------------------------------------------------
  // 11. Interactive 3D Tilt Effect on Auth Card
  // -------------------------------------------------------------------------
  function init3DTilt(element) {
    if (!element || window.innerWidth < 768) return;

    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;  // max 6 deg

      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }

  // -------------------------------------------------------------------------
  // 12. Floating Background Particle Canvas
  // -------------------------------------------------------------------------
  function initParticleCanvas() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw particles and faint connection lines
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? `rgba(99, 102, 241, ${p.alpha * 0.8})` : `rgba(165, 180, 252, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLight 
              ? `rgba(99, 102, 241, ${0.22 * (1 - dist / 110)})` 
              : `rgba(99, 102, 241, ${0.15 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // -------------------------------------------------------------------------
  // 13. Confetti Celebration
  // -------------------------------------------------------------------------
  function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

    for (let i = 0; i < 90; i++) {
      confettiPieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 14,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1
      });
    }

    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      confettiPieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    renderConfetti();
  }
});
