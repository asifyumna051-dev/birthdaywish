const CONFIG = {
  friendName: 'Cuddle Buddy',
  typingText: 'Happiest Birthday Cuddle Buddy ❤️',
  starCount: 80,
  balloonCount: 6,
  confettiCount: 30,
  sparkleInterval: 5000,
  particleCount: 60,
  mouseInfluence: 0.03,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Performance Optimization: Interval IDs for cleanup
let blueHeartsInterval = null;
let gift3HeartsInterval = null;

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/* ===================== INTRO PAGE ===================== */
(function() {
  var btn = document.getElementById('introBtn');
  var page = document.getElementById('introPage');
  if (btn && page) {
    btn.addEventListener('click', function() {
      page.classList.add('hide');
      setTimeout(function() { page.style.display = 'none'; }, 900);
      var song = document.getElementById('birthdaySong');
      if (song) {
        song.currentTime = 0;
        song.volume = 1;
        var playPromise = song.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            document.addEventListener('touchstart', function resumeAudio() {
              song.play().catch(function(){});
              document.removeEventListener('touchstart', resumeAudio);
            }, { once: true });
          });
        }
      }
    });
  }
})();

/* ===================== 3D PARTICLE GALAXY (canvas) ===================== */
const canvas = $('#universe');
const ctx = canvas.getContext('2d');
let W, H;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let particles = [];
let time = 0;

// Performance Optimization: Canvas resize with initial dimensions
function resizeCanvas() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  W = canvas.width = vw;
  H = canvas.height = vh;
  if (isTouchDevice() && CONFIG.particleCount > 20) {
    CONFIG.particleCount = 20;
    CONFIG.starCount = 30;
    CONFIG.balloonCount = 3;
    initParticles();
  }
}
resizeCanvas();
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeCanvas);
} else {
  window.addEventListener('resize', resizeCanvas);
}

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    const radius = Math.random() * 400 + 50;
    const angle = Math.random() * Math.PI * 2;
    const heightAngle = Math.random() * Math.PI - Math.PI / 2;
    this.baseX = Math.cos(angle) * radius * Math.cos(heightAngle);
    this.baseY = Math.sin(heightAngle) * radius * 0.3;
    this.baseZ = Math.sin(angle) * radius * Math.cos(heightAngle);
    this.size = Math.random() * 2.5 + 0.5;
    this.twinkleSpeed = Math.random() * 0.02 + 0.005;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.hue = Math.random() * 60 + 30;
    this.speed = Math.random() * 0.2 + 0.05;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitRadius = radius;
    this.heightAngle = heightAngle;
  }
  update() {
    this.orbitAngle += this.speed * 0.003;
    const r = this.orbitRadius;
    const a = this.orbitAngle;
    const h = this.heightAngle;
    this.baseX = Math.cos(a) * r * Math.cos(h);
    this.baseZ = Math.sin(a) * r * Math.cos(h);
    time += 0.001;
  }
  draw() {
    const depth = 400;
    const scale = depth / (depth + this.baseZ);
    const x2D = this.baseX * scale + W / 2;
    const y2D = this.baseY * scale + H / 2;
    const tx = (mouse.x - W / 2) * CONFIG.mouseInfluence * scale * 0.3;
    const ty = (mouse.y - H / 2) * CONFIG.mouseInfluence * scale * 0.3;
    const px = x2D + tx;
    const py = y2D + ty;
    if (px < -50 || px > W + 50 || py < -50 || py > H + 50) return;
    const alpha = Math.min(1, Math.max(0.1, scale * 0.8)) *
      (0.5 + 0.5 * Math.sin(time + this.twinkleSpeed + this.twinkleOffset));
    const size = this.size * scale;
    const hue = this.hue + (mouse.x / W) * 20;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
    ctx.arc(px, py, size * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = `hsla(${hue}, 90%, 85%, ${alpha})`;
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle());
  }
}
initParticles();

// Performance Optimization: Throttled canvas animation for mobile
let lastFrameTime = 0;
const MOBILE_FRAME_INTERVAL = isTouchDevice() ? 33 : 0; // ~30fps on mobile, 60fps desktop

function animateParticles(timestamp) {
  // Performance Optimization: Limit frame rate on mobile
  if (MOBILE_FRAME_INTERVAL && timestamp - lastFrameTime < MOBILE_FRAME_INTERVAL) {
    requestAnimationFrame(animateParticles);
    return;
  }
  lastFrameTime = timestamp;
  ctx.clearRect(0, 0, W, H);
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===================== MOUSE TRACKING ===================== */
document.addEventListener('mousemove', (e) => {
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
});

if (isTouchDevice()) {
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    }
  }, { passive: true });
}

document.addEventListener('mouseleave', () => {
  mouse.targetX = W / 2;
  mouse.targetY = H / 2;
});

/* ===================== CURSOR GLOW ===================== */
const cursor = $('#cursorGlow');
if (!isTouchDevice()) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

/* ===================== CSS STARS ===================== */
function createStars() {
  const container = $('#starsContainer');
  for (let i = 0; i < CONFIG.starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 0.5;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    star.style.animationDelay = Math.random() * 5 + 's';
    container.appendChild(star);
  }
}
createStars();

/* ===================== TYPING EFFECT ===================== */
function typeWriter(element, text, speed = 80) {
  element.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
const typingEl = $('#typingText');
typeWriter(typingEl, CONFIG.typingText);

/* ===================== JULY CALENDAR ===================== */
(function generateCalendar() {
  const container = $('#calendarDates');
  if (!container) return;
  const year = 2026;
  const month = 6;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += '<span></span>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const is15 = d === 15;
    html += `<span class="${is15 ? 'calendar-highlight' : ''}">${d}</span>`;
  }
  container.innerHTML = html;
})();

/* ===================== GIFT ROOM ===================== */
const giftRoom = $('#giftRoom');
const giftContent = $('#giftContent');
const giftContentClose = $('#giftContentClose');
const giftBackBtn = $('#giftBackBtn');
const giftBoxes = $$('.gift-box');

function updateGiftStates() {
  giftBoxes.forEach((box) => {
    box.classList.remove('locked', 'opened');
    box.classList.add('unlocked');
  });
}
updateGiftStates();

giftBoxes.forEach((box, i) => {
  box.addEventListener('click', () => {
    const num = i + 1;
    openGift(num, box);
  });
});

function openGift(num, box) {
  box.classList.add('opening');
  setTimeout(() => {
    showGiftContent(num);
    box.classList.remove('opening');
  }, 900);
}

// Memory Fix: Clear all heart-spawn intervals
function clearHeartIntervals() {
  if (blueHeartsInterval) { clearInterval(blueHeartsInterval); blueHeartsInterval = null; }
  if (gift3HeartsInterval) { clearInterval(gift3HeartsInterval); gift3HeartsInterval = null; }
}

function showGiftContent(num) {
  const inner = giftContent.querySelector('.gift-content-inner');
  if (num === 1) {
    inner.innerHTML = `
      <div class="gift-letter">
        <div class="letter-hearts" id="letterHearts"></div>
        <div class="letter-paper" id="letterPaper">
          <div class="letter-greeting">Happy Birthday, Kharus One! 💙</div>
          <div class="letter-body">
            Some people don't become special because of how long you've known them they become special because of how deeply they touch your heart. 🤍
            <br>
            Today is all about celebrating you the one who somehow managed to become one of the most meaningful parts of my life.
            <br>
            You may never realize how much your presence means to me, but you've brought comfort to my hardest days, laughter to my ordinary moments, and memories I'll always cherish. Even your little "kharus" moments have a place in my favorite memories.
            <br>
            I don't always say what I feel, but if there's one thing I truly want for you, it's this: May Allah bless you with a life full of peace, happiness, success, good health, and endless reasons to smile. May every prayer you whisper be answered in the most beautiful way, and may your heart always find the comfort it deserves.
            <br>
            Thank you for simply being you. Always remember, no matter where life takes us, there will always be someone quietly praying for your happiness, celebrating your victories, and wishing the very best for you.
            <br>
            So keep smiling, keep chasing your dreams, and never forget how incredibly special you are.
          </div>
          <div class="letter-sign">May Allah always protect you, bless your journey, and keep your smile shining forever. 🤍✨</div>
        </div>
      </div>
    `
    ;
    giftContent.classList.add('active');
    setTimeout(() => {
      const letterPaper = $('#letterPaper');
      if (letterPaper) letterPaper.classList.add('visible');
      spawnBlueHearts();
    }, 300);
  } else if (num === 2) {
    inner.innerHTML = `
      <div class="gift2-trick" id="gift2Trick">
        <div class="gift2-question">
          <div style="font-size:3rem; margin-bottom:20px;">💌</div>
          <h2 style="font-size:1.6rem; color:#fff; margin-bottom:10px;">I want to say something to you...</h2>
          <p style="color:rgba(255,255,255,0.5); margin-bottom:30px;">Want to see it?</p>
          <div class="gift2-buttons">
            <button class="gift2-btn gift2-yes" id="gift2Yes">Yes 💙</button>
            <button class="gift2-btn gift2-no" id="gift2No">No 😅</button>
          </div>
        </div>
        <div class="gift2-reveal" id="gift2Reveal" style="display:none;">
          <img src="https://media.giphy.com/media/IzXiddo2twMmdmU8Lv/giphy.gif" alt="Milk and Mocha" class="gift2-giphy" />
          <h2 class="gift2-final-msg">I hate u the most Kharus One 🫠💙🤍</h2>
        </div>
      </div>
    `;
    giftContent.classList.add('active');
    setTimeout(() => setupGift2Trick(), 100);
  } else if (num === 3) {
    inner.innerHTML = `
      <div class="gift3-reasons" id="gift3Reasons">
        <div class="letter-hearts" id="gift3Hearts"></div>
        <h2 class="gift3-title">some reason that you are close to me ✨</h2>
        <div class="gift3-card">
          <div class="gift3-bubble" style="--delay: 0.3s;">❤️you are the Best Listener even i am harsh to u </div>
          <div class="gift3-bubble" style="--delay: 0.9s;">😂 Biggest Drama King some times which makes me laugh </div>
          <div class="gift3-bubble" style="--delay: 1.5s;">🤍 cutest heart for everyone but the thing i dont like that in hard time u blame yourself instead of understandig the problem </div>
          <div class="gift3-bubble" style="--delay: 2.1s;">🌍 One of My Safe Place for talks </div>
          <div class="gift3-bubble" style="--delay: 2.7s;">✨ Forever Annoying but Precious</div>
        </div>
      </div>
    `;
    giftContent.classList.add('active');
    setTimeout(() => spawnGift3Hearts(), 300);
  } else if (num === 4) {
    inner.innerHTML = `
      <div class="gift4-cute-wrap">
        <img src="https://media.tenor.com/9WWlXDixcaIAAAAC/birthday-mocha.gif" alt="Birthday Bear" class="gift4-cute-img" onerror="this.onerror=null;this.src='https://media.giphy.com/media/JTIy6MKXfdfYDDBHV0/giphy.gif'" />
        <div class="gift4-cute-title">Once Again... Happy Birthday Kharus One</div>
        <p class="gift4-cute-line">I hope u like this little surprise 🤍</p>
        <p class="gift4-cute-line">Thank you for being such a special part of my life.</p>
        <div class="gift4-cute-from">From Your Chuzzi 🤍</div>
        <button class="gift4-back-btn" id="gift4BackBtn">🎁 Back to First Page</button>
      </div>
    `;
    giftContent.classList.add('active');
    setTimeout(() => {
      const backBtn = document.getElementById('gift4BackBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          giftContent.classList.remove('active');
          giftRoom.classList.remove('active');
          // Memory Fix: Clear heart spawn intervals when going back
          clearHeartIntervals();
          var song = document.getElementById('birthdaySong');
          if (song) { song.pause(); song.currentTime = 0; }
          const introPage = document.getElementById('introPage');
          if (introPage) {
            introPage.style.display = 'flex';
            introPage.style.opacity = '1';
            introPage.classList.remove('hide');
          }
        });
      }
    }, 100);
  } else {
    inner.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size:4rem; margin-bottom:20px; animation: giftFloat 2s ease-in-out infinite;">🎁</div>
        <h2 style="font-size:1.8rem; margin-bottom:15px; background: linear-gradient(135deg, #d4af37, #ff6b6b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
          Gift #${num}
        </h2>
        <p style="color:rgba(255,255,255,0.6); font-size:1.1rem;">Coming soon...</p>
      </div>
    `;
    giftContent.classList.add('active');
  }
}

function setupGift2Trick() {
  const noBtn = document.getElementById('gift2No');
  const yesBtn = document.getElementById('gift2Yes');
  const question = document.querySelector('.gift2-question');
  const reveal = document.getElementById('gift2Reveal');

  if (noBtn) {
    if (isTouchDevice()) {
      noBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        fleeFromCursor(noBtn);
      }, { passive: false });
    }
    noBtn.addEventListener('mouseenter', () => fleeFromCursor(noBtn));
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      if (question) question.style.display = 'none';
      if (reveal) reveal.style.display = 'block';
    });
  }
}

function fleeFromCursor(btn) {
  const rect = btn.getBoundingClientRect();
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const btnW = rect.width;
  const btnH = rect.height;
  const newX = Math.random() * (viewW - btnW - 40) + 20;
  const newY = Math.random() * (viewH - btnH - 40) + 20;
  btn.style.position = 'fixed';
  btn.style.left = newX + 'px';
  btn.style.top = newY + 'px';
  btn.style.zIndex = '100003';
}

function spawnBlueHearts() {
  const container = $('#letterHearts');
  if (!container) return;
  const hearts = ['💙', '🩵', '💙', '🩵', '💙'];
  // Mobile Fix: Store interval ID so we can clear it on close
  const initialBatch = [];
  for (let i = 0; i < 20; i++) {
    const id = setTimeout(() => {
      const h = document.createElement('span');
      h.className = 'letter-floating-heart';
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.left = Math.random() * 100 + '%';
      h.style.bottom = '-20px';
      h.style.fontSize = (Math.random() * 18 + 14) + 'px';
      h.style.animationDuration = (Math.random() * 3 + 4) + 's';
      container.appendChild(h);
      setTimeout(() => h.remove(), 6000);
    }, i * 200);
    initialBatch.push(id);
  }
  // Performance Optimization: Store the repeating interval for cleanup
  blueHeartsInterval = setInterval(() => {
    const h = document.createElement('span');
    h.className = 'letter-floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = Math.random() * 100 + '%';
    h.style.bottom = '-20px';
    h.style.fontSize = (Math.random() * 18 + 14) + 'px';
    h.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 6000);
  }, 800);
}

function spawnGift3Hearts() {
  const container = $('#gift3Hearts');
  if (!container) return;
  const hearts = ['❤️', '🤍', '💖', '💕', '💙'];
  // Performance Optimization: Store interval ID for cleanup
  gift3HeartsInterval = setInterval(() => {
    const h = document.createElement('span');
    h.className = 'letter-floating-heart';
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.left = Math.random() * 100 + '%';
    h.style.bottom = '-20px';
    h.style.fontSize = (Math.random() * 16 + 12) + 'px';
    h.style.animationDuration = (Math.random() * 3 + 4) + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 6000);
  }, 500);
}

if (giftContentClose) {
  giftContentClose.addEventListener('click', () => {
    giftContent.classList.remove('active');
    // Memory Fix: Clear heart spawn intervals when closing gift
    clearHeartIntervals();
  });
}

if (giftBackBtn) {
  giftBackBtn.addEventListener('click', () => {
    giftContent.classList.remove('active');
    giftRoom.classList.remove('active');
    // Memory Fix: Clear heart spawn intervals when going back
    clearHeartIntervals();
    var song = document.getElementById('birthdaySong');
    if (song) { song.pause(); song.currentTime = 0; }
    const introPage = document.getElementById('introPage');
    if (introPage) {
      introPage.style.display = 'flex';
      introPage.style.opacity = '1';
      introPage.classList.remove('hide');
    }
  });
}

// Button Fix: touchstart fallback only fires on actual taps, not scrolls
let heroBtnTouchStartY = 0;
$('#heroBtn').addEventListener('click', () => {
  giftRoom.classList.add('active');
});

if (isTouchDevice()) {
  $('#heroBtn').addEventListener('touchstart', (e) => {
    heroBtnTouchStartY = e.touches[0].clientY;
  }, { passive: true });
  $('#heroBtn').addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const dy = Math.abs(endY - heroBtnTouchStartY);
    // Only open if touch didn't scroll more than 10px
    if (dy < 10) {
      giftRoom.classList.add('active');
    }
  }, { passive: true });
}

/* ===================== 3D TILT EFFECT ===================== */
if (!isTouchDevice()) {
  const tiltElements = $$('[data-tilt]');
  tiltElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      const axis = el.dataset.tiltAxis;
      el.style.transform = axis === 'y'
        ? `perspective(600px) rotateY(${rotateY}deg)`
        : `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      el.style.transition = 'transform 0.05s';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
      el.style.transition = 'transform 0.5s ease';
    });
  });
}

/* ===================== MAGNETIC BUTTONS ===================== */
const magneticButtons = $$('.magnetic');
magneticButtons.forEach((btn) => {
  if (isTouchDevice()) {
    // Button Fix: Only apply magnetic effect on significant movement
    // to prevent breaking click/tap detection on mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let hasMoved = false;
    btn.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      hasMoved = false;
    }, { passive: true });
    btn.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        hasMoved = true;
        const rect = btn.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        const strength = parseInt(btn.dataset.strength) || 20;
        const maxDist = 200;
        const d2 = Math.sqrt(x * x + y * y);
        if (d2 < maxDist) {
          const force = (1 - d2 / maxDist) * strength;
          const angle = Math.atan2(y, x);
          const moveX = Math.cos(angle) * force;
          const moveY = Math.sin(angle) * force;
          btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
        }
      }
    }, { passive: true });
    btn.addEventListener('touchend', () => {
      btn.style.transform = '';
    });
  } else {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = parseInt(btn.dataset.strength) || 20;
      const dist = Math.sqrt(x * x + y * y);
      const maxDist = 200;
      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * strength;
        const angle = Math.atan2(y, x);
        const moveX = Math.cos(angle) * force;
        const moveY = Math.sin(angle) * force;
        btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  }
});

/* ===================== RIPPLE ON CLICK ===================== */
if (!isTouchDevice()) {
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });
}

/* ===================== TEXT SCRAMBLE ON HOVER ===================== */
const scrambleElements = $$('[data-scramble]');
scrambleElements.forEach((el) => {
  const originalText = el.textContent;
  el.addEventListener('mouseenter', () => {
    let iterations = 0;
    const maxIterations = 8;
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const interval = setInterval(() => {
      el.textContent = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      iterations += 1;
      if (iterations > originalText.length) {
        clearInterval(interval);
        el.textContent = originalText;
      }
    }, 40);
  });
});

/* ===================== BALLOONS ===================== */
function createBalloons() {
  const container = $('#balloonsContainer');
  const colors = ['#d4af37', '#ff6b6b', '#48dbfb', '#ff9ff3', '#feca57', '#54a0ff', '#1dd1a1', '#ff6348'];
  for (let i = 0; i < CONFIG.balloonCount; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const color = colors[i % colors.length];
    balloon.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`;
    balloon.style.left = (Math.random() * 90 + 5) + '%';
    balloon.style.setProperty('--duration', (Math.random() * 4 + 6) + 's');
    balloon.style.setProperty('--delay', (Math.random() * 5) + 's');
    container.appendChild(balloon);
  }
}
createBalloons();

/* ===================== SPARKLES ===================== */
function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.textContent = ['\u2726', '\u2727', '\u00B7', '\u2716', '\u22C6'][Math.floor(Math.random() * 5)];
  sparkle.style.left = Math.random() * 100 + '%';
  sparkle.style.bottom = '0';
  sparkle.style.color = ['#d4af37', '#ff6b6b', '#48dbfb', '#ff9ff3'][Math.floor(Math.random() * 4)];
  sparkle.style.setProperty('--duration', (Math.random() * 3 + 3) + 's');
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 6000);
}
// Performance Optimization: Reduce sparkle frequency on mobile
setInterval(createSparkle, isTouchDevice() ? 10000 : CONFIG.sparkleInterval);

/* ===================== SCROLL PARALLAX ===================== */
// Performance Optimization: Throttle scroll with rAF
let scrollTicking = false;
document.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const stars = $('#starsContainer');
      if (stars) {
        stars.style.transform = `translateY(${scrollY * 0.03}px)`;
      }
      const aurora = document.querySelector('.aurora-bg');
      if (aurora) {
        aurora.style.transform = `translateY(${scrollY * -0.02}px)`;
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

/* ===================== RESIZE HANDLER ===================== */
// Performance Optimization: Debounce resize to prevent excessive canvas redraws
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 150);
});

/* ===================== INTRO STARS & SPARKLES ===================== */
(function introEffects() {
  var starsContainer = document.getElementById('introStars');
  var sparklesContainer = document.getElementById('introSparkles');
  if (!starsContainer || !sparklesContainer) return;

  for (var i = 0; i < 60; i++) {
    var star = document.createElement('div');
    star.className = 'intro-star';
    var size = Math.random() * 2.5 + 0.5;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.setProperty('--dur', (Math.random() * 3 + 2) + 's');
    star.style.setProperty('--delay', (Math.random() * 4) + 's');
    starsContainer.appendChild(star);
  }

  var sparkleChars = ['✦', '✧', '·', '✶', '❋', '✵'];
  // Performance Optimization: Reduce intro sparkle frequency on mobile
  var sparkleIntervalMs = isTouchDevice() ? 1600 : 800;
  setInterval(function() {
    var sp = document.createElement('div');
    sp.className = 'intro-floating-sparkle';
    sp.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    sp.style.left = Math.random() * 100 + '%';
    sp.style.bottom = '0';
    sp.style.color = ['#d4af37', '#48dbfb', '#ff9ff3', '#fff'][Math.floor(Math.random() * 4)];
    sp.style.setProperty('--dur', (Math.random() * 3 + 3) + 's');
    sparklesContainer.appendChild(sp);
    setTimeout(function() { sp.remove(); }, 6000);
  }, 800);
})();