/* ===================================================
   JS GALAXY PLAYGROUND — script.js
   Vanilla JS: Preloader, Typing, Cursor, Counters,
   Scroll Reveal, Calculator, Todo, Password Gen, Form
   =================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------
     PRELOADER
  -------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');
  const loadMessages = [
    'Preparing 3D Experience...',
    'Loading Galaxy Assets...',
    'Launching Frontend Playground...'
  ];
  let msgIndex = 0;

  const cycleMsgs = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadMessages.length;
    if (preloaderText) preloaderText.textContent = loadMessages[msgIndex];
  }, 750);

  window.addEventListener('load', () => {
    setTimeout(() => {
      clearInterval(cycleMsgs);
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => { preloader.style.display = 'none'; }, 700);
      }
    }, 2500);
  });

  /* --------------------------------------------------
     CURSOR GLOW
  -------------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    let rafId = null;
    window.addEventListener('mousemove', (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top  = e.clientY + 'px';
      });
    });
  }

  /* --------------------------------------------------
     TYPING ANIMATION
  -------------------------------------------------- */
  const typedEl = document.getElementById('heroTyped');
  const typedWords = ['HTML', 'CSS', 'JavaScript', 'Three.js', 'Creative UI Design'];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingTimer = null;

  function typeStep() {
    const word = typedWords[wordIdx];
    if (isDeleting) {
      charIdx--;
      typedEl.textContent = word.slice(0, charIdx);
    } else {
      charIdx++;
      typedEl.textContent = word.slice(0, charIdx);
    }

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIdx === word.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % typedWords.length;
      delay = 300;
    }

    typingTimer = setTimeout(typeStep, delay);
  }

  if (typedEl) {
    setTimeout(typeStep, 1200);
  }

  /* --------------------------------------------------
     SMOOTH SCROLL FOR NAV LINKS
  -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------------------
     NAVBAR SCROLL EFFECT
  -------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.background = window.scrollY > 20
        ? 'rgba(7,0,20,0.95)'
        : 'rgba(7,0,20,0.7)';
    }, { passive: true });
  }

  /* --------------------------------------------------
     SCROLL REVEAL (Intersection Observer)
  -------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          // Trigger skill bar animation
          entry.target.querySelectorAll && entry.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.style.width = bar.style.getPropertyValue('--fill') || getComputedStyle(bar).getPropertyValue('--fill');
          });
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal-section, .reveal-card').forEach(el => {
    revealObserver.observe(el);
  });

  /* --------------------------------------------------
     STAT COUNTERS (requestAnimationFrame)
  -------------------------------------------------- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.getElementById('stats');
  if (statsSection) statObserver.observe(statsSection);

  /* --------------------------------------------------
     CALCULATOR
  -------------------------------------------------- */
  const calcBtn    = document.getElementById('calcBtn');
  const calcA      = document.getElementById('calcA');
  const calcB      = document.getElementById('calcB');
  const calcOp     = document.getElementById('calcOp');
  const calcResult = document.getElementById('calcResult');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const a  = parseFloat(calcA.value);
      const b  = parseFloat(calcB.value);
      const op = calcOp.value;

      if (isNaN(a) || isNaN(b)) {
        calcResult.style.color = 'var(--magenta)';
        calcResult.textContent = '⚠ Enter valid numbers first.';
        return;
      }

      let result;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0) {
            calcResult.style.color = 'var(--magenta)';
            calcResult.textContent = '⚠ Cannot divide by zero.';
            return;
          }
          result = a / b;
          break;
        default:
          calcResult.textContent = 'Unknown operation.';
          return;
      }

      const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      calcResult.style.color = 'var(--cyan)';
      calcResult.textContent = `${a} ${opSymbols[op]} ${b} = ${parseFloat(result.toFixed(10))}`;
    });

    // Allow Enter key in inputs
    [calcA, calcB].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') calcBtn.click();
      });
    });
  }

  /* --------------------------------------------------
     TO-DO APP (localStorage)
  -------------------------------------------------- */
  const todoInput   = document.getElementById('todoInput');
  const todoAddBtn  = document.getElementById('todoAddBtn');
  const todoList    = document.getElementById('todoList');
  const TODO_KEY    = 'jsgalaxy_todos';

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
    } catch { return []; }
  }

  function saveTodos(todos) {
    try { localStorage.setItem(TODO_KEY, JSON.stringify(todos)); } catch {}
  }

  function renderTodos() {
    if (!todoList) return;
    const todos = loadTodos();
    todoList.innerHTML = '';
    if (todos.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = 'No tasks yet. Add one above!';
      empty.style.cssText = 'color:var(--text-muted);cursor:default;border-color:transparent;background:transparent;font-size:0.8rem;';
      todoList.appendChild(empty);
      return;
    }
    todos.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = task;
      li.title = 'Click to delete';
      li.addEventListener('click', () => {
        const updated = loadTodos();
        updated.splice(index, 1);
        saveTodos(updated);
        renderTodos();
      });
      todoList.appendChild(li);
    });
  }

  function addTodo() {
    if (!todoInput) return;
    const val = todoInput.value.trim();
    if (!val) return;
    const todos = loadTodos();
    todos.push(val);
    saveTodos(todos);
    todoInput.value = '';
    renderTodos();
  }

  if (todoAddBtn) todoAddBtn.addEventListener('click', addTodo);
  if (todoInput) {
    todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  }
  renderTodos();

  /* --------------------------------------------------
     PASSWORD GENERATOR (Crypto API)
  -------------------------------------------------- */
  const passGenBtn  = document.getElementById('passGenBtn');
  const passResult  = document.getElementById('passResult');
  const passCopyBtn = document.getElementById('passCopyBtn');
  const passMsg     = document.getElementById('passMsg');
  const passUpper   = document.getElementById('passUpper');
  const passNumbers = document.getElementById('passNumbers');
  const passSpecial = document.getElementById('passSpecial');

  const CHAR_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
  const CHAR_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const CHAR_NUMBERS = '0123456789';
  const CHAR_SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  function generatePassword() {
    let charset = CHAR_LOWER;
    if (passUpper   && passUpper.checked)   charset += CHAR_UPPER;
    if (passNumbers && passNumbers.checked) charset += CHAR_NUMBERS;
    if (passSpecial && passSpecial.checked) charset += CHAR_SPECIAL;

    const length = 16;
    const array  = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    return password;
  }

  if (passGenBtn) {
    passGenBtn.addEventListener('click', () => {
      const pw = generatePassword();
      if (passResult) passResult.textContent = pw;
      if (passMsg) {
        passMsg.textContent = '✓ New secure password generated.';
        setTimeout(() => { passMsg.textContent = ''; }, 2500);
      }
    });
  }

  if (passCopyBtn) {
    passCopyBtn.addEventListener('click', async () => {
      const text = passResult ? passResult.textContent : '';
      if (!text || text === '••••••••••••') return;
      try {
        await navigator.clipboard.writeText(text);
        if (passMsg) {
          passMsg.textContent = '✓ Copied to clipboard!';
          setTimeout(() => { passMsg.textContent = ''; }, 2000);
        }
        passCopyBtn.textContent = '✓';
        setTimeout(() => { passCopyBtn.textContent = '⎘'; }, 1500);
      } catch {
        if (passMsg) passMsg.textContent = '⚠ Copy failed — select manually.';
      }
    });
  }

  /* --------------------------------------------------
     CONTACT FORM VALIDATION
  -------------------------------------------------- */
  const contactSendBtn = document.getElementById('contactSendBtn');
  const formMsg        = document.getElementById('formMsg');

  function showFormMsg(message, type) {
    if (!formMsg) return;
    formMsg.textContent = message;
    formMsg.className   = 'form-msg ' + type;
    formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
      formMsg.className = 'form-msg';
      formMsg.textContent = '';
    }, 4500);
  }

  function validateEmail(email) {
    // RFC-compatible basic pattern: must have @ and a dot after the @
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }

  if (contactSendBtn) {
    contactSendBtn.addEventListener('click', () => {
      const name    = (document.getElementById('contactName')?.value || '').trim();
      const email   = (document.getElementById('contactEmail')?.value || '').trim();
      const subject = (document.getElementById('contactSubject')?.value || '').trim();
      const msg     = (document.getElementById('contactMsg')?.value || '').trim();

      if (!name) {
        showFormMsg('⚠ Please enter your name.', 'error');
        document.getElementById('contactName')?.focus();
        return;
      }
      if (!email) {
        showFormMsg('⚠ Please enter your email address.', 'error');
        document.getElementById('contactEmail')?.focus();
        return;
      }
      if (!validateEmail(email)) {
        showFormMsg('⚠ That email address doesn\'t look right. Check the format (e.g. you@domain.com).', 'error');
        document.getElementById('contactEmail')?.focus();
        return;
      }
      if (!subject) {
        showFormMsg('⚠ Please add a subject line.', 'error');
        document.getElementById('contactSubject')?.focus();
        return;
      }
      if (!msg) {
        showFormMsg('⚠ Please write your message before sending.', 'error');
        document.getElementById('contactMsg')?.focus();
        return;
      }
      if (msg.length < 20) {
        showFormMsg('⚠ Message is a bit short — tell me more! (20 characters minimum)', 'error');
        document.getElementById('contactMsg')?.focus();
        return;
      }

      // Simulate successful send (no backend in this static demo)
      showFormMsg(`✓ Message sent, ${name}! I'll get back to you soon.`, 'success');
      document.getElementById('contactName').value    = '';
      document.getElementById('contactEmail').value   = '';
      document.getElementById('contactSubject').value = '';
      document.getElementById('contactMsg').value     = '';
    });
  }

})();