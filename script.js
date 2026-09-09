const musicPlayer = document.getElementById('music-player');
const musicIcon = document.getElementById('music-icon');
const musicLabel = document.getElementById('music-label');
const bgMusic = document.getElementById('bg-music');

let isPlaying = false;

// pastikan musik bisa dimulai setelah gesture pertama
document.body.addEventListener("click", () => {
  if (!isPlaying && bgMusic.paused) {
    bgMusic.play().catch(err => console.log("Blocked:", err));
  }
}, { once: true });

musicPlayer.addEventListener('click', () => {
  if (!isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicIcon.textContent = "🎵";
      musicLabel.textContent = "Pause Music";
    }).catch(err => {
      console.log("Play failed:", err);
      alert("👉 Tap sekali lagi untuk memulai musik 🎵");
    });
  } else {
    bgMusic.pause();
    isPlaying = false;
    musicIcon.textContent = "🔇";
    musicLabel.textContent = "Play Music";
  }
});

// Create particles
function createParticles() {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.animationDelay = (Math.random() * 6) + 's';
        document.body.appendChild(particle);
    }
}

createParticles();

// Enhanced Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slidesWrapper = document.getElementById('slides');
const indicatorsContainer = document.getElementById('indicators');
let autoSlideInterval;

// Create indicators
for (let i = 0; i < totalSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'indicator';
    indicator.addEventListener('click', () => goToSlide(i));
    indicatorsContainer.appendChild(indicator);
}

const indicators = document.querySelectorAll('.indicator');

function updateIndicators() {
    indicators.forEach((ind, index) => {
        ind.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlides();
    updateIndicators();
    resetAutoSlide();
}

function updateSlides() {
    slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.style.opacity = 1;
        } else {
            slide.style.opacity = 0;
        }
    });
}

document.getElementById('prevBtn').addEventListener('click', () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    goToSlide((currentSlide + 1) % totalSlides);
});

// Auto-slide every 4 seconds
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % totalSlides);
    }, 4000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    if (e.key === 'ArrowRight') goToSlide((currentSlide + 1) % totalSlides);
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

slidesWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

slidesWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX) goToSlide((currentSlide + 1) % totalSlides);
    else if (touchEndX > touchStartX) goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
});

// Pause on hover
const slideshowContainer = document.querySelector('.slideshow-container');
slideshowContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
slideshowContainer.addEventListener('mouseleave', startAutoSlide);

// Initial setup
updateSlides();
updateIndicators();
startAutoSlide();

// Fireworks effect
function createFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    function createExplosion(x, y) {
        const colors = ["#FFD700", "#FFF5CC", "#FFFAE3", "#F5E6A3"];
        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.05,
                friction: 0.92
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.alpha -= 0.015;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.fill();

            if (p.alpha <= 0) particles.splice(i, 1);
        });

        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.style.display = 'none';
        }
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) {
            hex = hex.split("").map(h => h + h).join("");
        }
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
    }

    canvas.style.display = "block";
    createExplosion(canvas.width / 2, canvas.height / 2);
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createExplosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
        }, i * 600);
    }

    animate();
}

// Gift button interaction with fireworks
document.getElementById('giftBtn').addEventListener('click', () => {
    createFireworks();
    
    const message = document.getElementById('message');
    message.classList.remove('hidden');
    message.style.animation = 'softFadeIn 1.5s ease-out';
    
    const surprise = document.getElementById('surprise');
    if (!surprise.classList.contains('hidden')) {
        surprise.classList.add('hidden');
    }
});

// Surprise button interaction with fireworks
document.getElementById('surpriseBtn').addEventListener('click', () => {
    createFireworks();
    
    const surprise = document.getElementById('surprise');
    surprise.classList.toggle('hidden');
    if (!surprise.classList.contains('hidden')) {
        surprise.style.animation = 'softFadeIn 1.5s ease-out';
        
        const message = document.getElementById('message');
        if (!message.classList.contains('hidden')) {
            message.classList.add('hidden');
        }
    }
});

// Countdown to the 10 September 2026 milestone.
// After that exact moment, the main page stays on the completed state
// and shows a button to the 2026 birthday page.
const birthdayTarget = new Date(2026, 8, 10, 0, 0, 0, 0);
const birthdayPageUrl = 'https://bbmoralezz.github.io/birthday/2026/';
let countdownFinished = false;

function showCountdownFinished() {
    if (countdownFinished) return;
    countdownFinished = true;

    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';

    const countdown = document.querySelector('.countdown');
    if (countdown) {
        countdown.insertAdjacentHTML('beforeend', '<div id="birthday-2026-link" class="mt-6"><a href="' + birthdayPageUrl + '" class="inline-block px-6 py-3 rounded-full bg-pink-500 text-white font-semibold shadow-lg hover:bg-pink-600 transition-colors">🎂 Buka Birthday 2026</a></div>');
    }
}

function updateCountdown() {
    const now = new Date();
    const diff = birthdayTarget - now;

    if (diff <= 0) {
        showCountdownFinished();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Initialize countdown and update every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Responsive canvas resizing
window.addEventListener('resize', () => {
    const canvas = document.getElementById('fireworks-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Gift Box Animation
document.getElementById('giftBtn').addEventListener('click', () => {
  const giftBox = document.getElementById('gift-box');
  const message = document.getElementById('message');
  const surprise = document.getElementById('surprise');

  giftBox.classList.remove('hidden');

  const img = giftBox.querySelector('img');
  img.classList.add('gift-open');

  setTimeout(() => {
    giftBox.classList.add('hidden');
    img.classList.remove('gift-open');
    message.classList.remove('hidden');
    message.style.animation = 'softFadeIn 1.5s ease-out';
    if (!surprise.classList.contains('hidden')) {
      surprise.classList.add('hidden');
    }
  }, 1500);
});

// Blessing Interactivity
document.querySelectorAll('.light').forEach((el) => {
  el.addEventListener('click', () => {
    const text = document.createElement('div');
    text.className = 'blessing-text';
    text.textContent = el.getAttribute('title');
    el.insertAdjacentElement('afterend', text);
    setTimeout(() => text.remove(), 3000);
  });
});

// Countdown Progress Bar
function updateProgressBar() {
  const now = new Date();
  const startYear = new Date(2025, 8, 10);
  const total = birthdayTarget - startYear;
  const elapsed = now - startYear;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const progress = document.getElementById('progress');
  if (progress) progress.style.width = percent + "%";
}

setInterval(updateProgressBar, 1000);
updateProgressBar();
