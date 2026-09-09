/**
 * ============================================================
 *  script.js — Birthday Website
 *  Semua interaksi, animasi, fallback, dan efek spesial.
 * ============================================================
 */

(function () {
    'use strict';

    // ---------- DOM REFERENCES ----------
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const sections = $$('.section');
    const opening = $('#opening');
    const hero = $('#hero');
    const characterSection = $('#character');
    const countdownSection = $('#countdown');
    const memoriesSection = $('#memories');
    const letterSection = $('#letter');
    const cakeSection = $('#cake');
    const reasonsSection = $('#reasons');
    const secretSection = $('#secret');
    const finalSection = $('#final');

    const btnOpen = $('#btnOpen');
    const btnMusic = $('#btnMusic');
    const btnWish = $('#btnWish');
    const btnSecret = $('#btnSecret');
    const btnReplay = $('#btnReplay');

    const heroName = $('#heroName');
    const finalName = $('#finalName');
    const mainPhoto = $('#mainPhoto');

    const openingCharacter = $('#openingCharacter');
    const interactiveChar = $('#interactiveCharacter');
    const characterWrapper = $('#characterWrapper');
    const speechBubble = $('#speechBubble');
    const bubbleText = $('#bubbleText');

    const daysEl = $('#days');
    const hoursEl = $('#hours');
    const minutesEl = $('#minutes');
    const secondsEl = $('#seconds');
    const countdownMsg = $('#countdownMessage');

    const carousel = $('#memoriesCarousel');
    const modal = $('#memoryModal');
    const modalImg = $('#modalImage');
    const modalCaption = $('#modalCaption');
    const modalClose = $('#modalClose');

    const envelope = $('#envelope');
    const letterContent = $('#letterContent');
    const letterText = $('#letterText');

    const candleFlame = $('#candleFlame');
    const wishMessage = $('#wishMessage');

    const reasonsGrid = $('#reasonsGrid');
    const secretReveal = $('#secretReveal');

    const finalTitle = $('#finalTitle');

    // ---------- AUDIO ----------
    let audio = null;
    let isMusicPlaying = false;
    let musicReady = false;

    // ---------- CONFIG & FALLBACK (dari HTML) ----------
    // birthdayConfig, fallbackAssets, defaultMemories, defaultReasons
    // sudah didefinisikan di <script> dalam HTML.

    // ---------- HELPER: Asset or Fallback ----------
    function assetOrFallback(assetPath, fallbackPath) {
        return (assetPath && assetPath.trim() !== '') ? assetPath : fallbackPath;
    }

    // ---------- HELPER: Random ----------
    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ---------- 1. IMAGE FALLBACK SYSTEM ----------
    function setupImageFallbacks() {
        $$('img[data-fallback]').forEach((img) => {
            img.addEventListener('error', function onError() {
                const fallback = this.dataset.fallback;
                if (this.src.includes(fallback)) return; // cegah infinite loop
                this.src = fallback;
                // tambahkan class untuk styling jika perlu
                this.classList.add('fallback-loaded');
            });
        });
    }

    // ---------- 2. NAVIGATION / SECTION TOGGLE ----------
    function showSection(sectionId) {
        sections.forEach((sec) => sec.classList.remove('active'));
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            // trigger reflow untuk animasi
            void target.offsetWidth;
        }
    }

    // ---------- 3. OPENING SCREEN ----------
    function setupOpening() {
        // Karakter opening pakai fallback
        const charSrc = assetOrFallback(
            birthdayConfig.character,
            fallbackAssets.character
        );
        openingCharacter.src = charSrc;
        openingCharacter.dataset.fallback = fallbackAssets.character;

        btnOpen.addEventListener('click', function (e) {
            e.preventDefault();

            // 1. Bounce animation
            this.style.transform = 'scale(0.85)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            // 2. Burst of hearts
            triggerHeartBurst(
                this.getBoundingClientRect().left + this.offsetWidth / 2,
                this.getBoundingClientRect().top + this.offsetHeight / 2,
                30
            );

            // 3. Mulai musik (interaksi user pertama)
            initMusic();

            // 4. Pindah ke hero setelah delay
            setTimeout(() => {
                showSection('hero');
                // trigger confetti kecil
                triggerMiniConfetti();
            }, 400);
        });
    }

    // ---------- 4. HERO SECTION ----------
    function setupHero() {
        const name = birthdayConfig.name?.trim() || 'Someone Special';
        heroName.textContent = name;
        finalName.textContent = name;

        // Main Photo
        const photoSrc = assetOrFallback(
            birthdayConfig.mainPhoto,
            fallbackAssets.mainPhoto
        );
        mainPhoto.src = photoSrc;
        mainPhoto.dataset.fallback = fallbackAssets.mainPhoto;

        // Ganti judul final juga
        if (finalTitle) {
            finalTitle.innerHTML =
                `HAPPY BIRTHDAY, <span id="finalName">${name}</span>! 🎂💗`;
        }
    }

    // ---------- 5. INTERACTIVE CHARACTER ----------
    function setupCharacter() {
        const charSrc = assetOrFallback(
            birthdayConfig.character,
            fallbackAssets.character
        );
        interactiveChar.src = charSrc;
        interactiveChar.dataset.fallback = fallbackAssets.character;

        const messages = [
            'Hehehe! Happy Birthday! 🥳',
            'You are so cute! ♡',
            'Today is all about you! ✨',
            'Semangat terus! 💪',
            'I love your smile! 😊',
            'Have a wonderful day! 🌷',
            'You deserve the world! 🌍',
        ];

        let bubbleTimeout = null;

        characterWrapper.addEventListener('click', function (e) {
            e.stopPropagation();

            // Random message
            const msg = randomItem(messages);
            bubbleText.textContent = msg;

            // Tampilkan bubble
            speechBubble.classList.add('show');

            // Animasi lompat karakter
            interactiveChar.style.animation = 'none';
            void interactiveChar.offsetWidth;
            interactiveChar.style.animation = 'bounceSoft 0.4s ease';

            // Hati kecil keluar dari karakter
            triggerHeartBurst(
                this.getBoundingClientRect().left + this.offsetWidth / 2,
                this.getBoundingClientRect().top + 10,
                8
            );

            // Clear timeout sebelumnya
            if (bubbleTimeout) clearTimeout(bubbleTimeout);
            bubbleTimeout = setTimeout(() => {
                speechBubble.classList.remove('show');
            }, 2800);
        });

        // Tap di luar bubble untuk sembunyikan (opsional)
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.character-wrapper')) {
                speechBubble.classList.remove('show');
            }
        });
    }

    // ---------- 6. COUNTDOWN ----------
    function setupCountdown() {
        const targetDate = new Date(birthdayConfig.birthday + 'T00:00:00');
        const now = new Date();

        if (isNaN(targetDate.getTime())) {
            countdownMsg.textContent = 'Your special day is here! 🎉';
            daysEl.textContent = '--';
            hoursEl.textContent = '--';
            minutesEl.textContent = '--';
            secondsEl.textContent = '--';
            return;
        }

        function updateCountdown() {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                countdownMsg.textContent = 'Your special day is here! 🎉';
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');

            countdownMsg.textContent = `Counting down to ${birthdayConfig.name || 'your'} birthday! 🕰️`;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ---------- 7. MEMORIES / GALLERY ----------
    function setupMemories() {
        const memories = (birthdayConfig.memories && birthdayConfig.memories.length > 0)
            ? birthdayConfig.memories
            : defaultMemories;

        if (!memories || memories.length === 0) {
            carousel.innerHTML =
                '<p style="text-align:center; padding:2rem; color:var(--soft-brown);">More memories are waiting here... 📸</p>';
            return;
        }

        carousel.innerHTML = '';

        memories.forEach((mem, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            // Rotasi acak antara -3deg sampai 3deg
            const rot = randomBetween(-3, 3);
            card.style.setProperty('--rot', rot + 'deg');

            const img = document.createElement('img');
            img.src = mem.image || fallbackAssets.memoryImages[index % fallbackAssets.memoryImages.length];
            img.alt = mem.caption || 'Memory';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.dataset.fallback = fallbackAssets.memoryImages[index % fallbackAssets.memoryImages.length];

            // Error fallback untuk memory
            img.addEventListener('error', function () {
                const fb = this.dataset.fallback;
                if (this.src.includes(fb)) return;
                this.src = fb;
            });

            const caption = document.createElement('p');
            caption.className = 'memory-caption';
            caption.textContent = mem.caption || 'A beautiful memory ✨';

            card.appendChild(img);
            card.appendChild(caption);

            // Klik untuk modal
            card.addEventListener('click', function () {
                const imgSrc = this.querySelector('img').src;
                const cap = this.querySelector('.memory-caption').textContent;
                openMemoryModal(imgSrc, cap);
            });

            carousel.appendChild(card);
        });
    }

    // Memory Modal
    function openMemoryModal(src, caption) {
        modalImg.src = src;
        modalCaption.textContent = caption;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMemoryModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeMemoryModal);
    modal.addEventListener('click', function (e) {
        if (e.target === this) closeMemoryModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMemoryModal();
    });

    // ---------- 8. LOVE LETTER ----------
    function setupLetter() {
        // Isi surat dari config
        if (birthdayConfig.letter) {
            letterText.innerHTML = birthdayConfig.letter.replace(/\n/g, '<br />');
        }

        let isOpen = false;

        envelope.addEventListener('click', function (e) {
            e.stopPropagation();
            isOpen = !isOpen;

            this.classList.toggle('open', isOpen);
            letterContent.classList.toggle('open', isOpen);

            if (isOpen) {
                // Efek confetti kecil saat surat terbuka
                triggerMiniConfetti();
                triggerHeartBurst(
                    this.getBoundingClientRect().left + this.offsetWidth / 2,
                    this.getBoundingClientRect().top + 20,
                    12
                );
            }
        });
    }

    // ---------- 9. BIRTHDAY CAKE ----------
    function setupCake() {
        let isLit = false;
        let wishMade = false;

        // Klik kue untuk nyalakan/matikan lilin
        const cakeEl = document.querySelector('.cake');
        if (cakeEl) {
            cakeEl.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleCandle();
            });
        }

        function toggleCandle() {
            isLit = !isLit;
            candleFlame.classList.toggle('lit', isLit);
            if (isLit) {
                triggerHeartBurst(
                    candleFlame.getBoundingClientRect().left + 16,
                    candleFlame.getBoundingClientRect().top + 12,
                    6
                );
            }
        }

        // Tombol Make a Wish
        btnWish.addEventListener('click', function () {
            if (!isLit) {
                // Jika lilin belum menyala, nyalakan dulu
                isLit = true;
                candleFlame.classList.add('lit');
                setTimeout(() => {
                    doWish();
                }, 300);
            } else {
                doWish();
            }
        });

        function doWish() {
            if (wishMade) return;
            wishMade = true;

            // 1. Matikan lilin
            isLit = false;
            candleFlame.classList.remove('lit');

            // 2. Layar sedikit redup (efek dim) via overlay sementara
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                    position: fixed; top:0; left:0; width:100%; height:100%;
                    background: rgba(0,0,0,0.2); z-index:80;
                    pointer-events:none; transition: opacity 0.5s ease;
                    opacity:0;
                `;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });

            // 3. Confetti besar-besaran & hearts
            triggerBigConfetti();
            triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 50);

            // 4. Tampilkan pesan
            wishMessage.textContent = 'I hope your wish comes true 🤍';
            wishMessage.classList.add('show');

            // 5. Hilangkan overlay
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            }, 600);

            // Nonaktifkan tombol setelah wish
            btnWish.disabled = true;
            btnWish.style.opacity = '0.5';
            btnWish.textContent = '✨ Wish Granted ✨';
        }
    }

    // ---------- 10. REASONS (Scroll Reveal) ----------
    function setupReasons() {
        const reasons = (birthdayConfig.reasons && birthdayConfig.reasons.length > 0)
            ? birthdayConfig.reasons
            : defaultReasons;

        reasonsGrid.innerHTML = '';

        reasons.forEach((reason) => {
            const card = document.createElement('div');
            card.className = 'reason-card';

            const title = document.createElement('h3');
            title.textContent = reason.title;

            const desc = document.createElement('p');
            desc.textContent = reason.desc;

            card.appendChild(title);
            card.appendChild(desc);
            reasonsGrid.appendChild(card);
        });

        // Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.reason-card').forEach((card) => {
            observer.observe(card);
        });
    }

    // ---------- 11. SECRET SECTION ----------
    function setupSecret() {
        let revealed = false;

        btnSecret.addEventListener('click', function () {
            if (revealed) return;
            revealed = true;

            // Efek transition: hearts memenuhi layar
            triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 60);

            // Tampilkan reveal dengan animasi
            secretReveal.classList.add('show');

            // Sparkle effect
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const x = randomBetween(0, window.innerWidth);
                    const y = randomBetween(0, window.innerHeight);
                    createSparkle(x, y);
                }, i * 80);
            }

            // Sembunyikan tombol
            this.style.display = 'none';
        });
    }

    // ---------- 12. FINAL CELEBRATION & REPLAY ----------
    function setupFinal() {
        btnReplay.addEventListener('click', function () {
            // Reset semua state
            resetAll();
            showSection('opening');
            // trigger efek
            triggerMiniConfetti();
        });
    }

    function resetAll() {
        // Character bubble
        speechBubble.classList.remove('show');

        // Letter
        envelope.classList.remove('open');
        letterContent.classList.remove('open');

        // Cake
        candleFlame.classList.remove('lit');
        wishMessage.classList.remove('show');
        wishMessage.textContent = '';
        btnWish.disabled = false;
        btnWish.style.opacity = '1';
        btnWish.textContent = 'Make a Wish ✨';

        // Secret
        secretReveal.classList.remove('show');
        btnSecret.style.display = 'inline-block';

        // Music (tetap jalan, tidak direset)
        // Countdown (tetap jalan)
        // Memories (tetap)
        // Reasons (tetap)

        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---------- 13. BACKGROUND MUSIC ----------
    function initMusic() {
        if (musicReady) return;
        musicReady = true;

        const musicSrc = assetOrFallback(
            birthdayConfig.music,
            fallbackAssets.music
        );

        try {
            audio = new Audio(musicSrc);
            audio.loop = true;
            audio.volume = 0.5;
            audio.preload = 'auto';

            // Coba play
            audio.play().then(() => {
                isMusicPlaying = true;
                btnMusic.textContent = '🔊';
                btnMusic.classList.remove('muted');
            }).catch(() => {
                // Autoplay diblokir, user harus klik tombol musik
                isMusicPlaying = false;
                btnMusic.textContent = '🔇';
                btnMusic.classList.add('muted');
            });
        } catch (e) {
            console.warn('Music not available, using fallback.');
            btnMusic.style.display = 'none';
        }

        // Tombol toggle
        btnMusic.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!audio) return;

            if (isMusicPlaying) {
                audio.pause();
                isMusicPlaying = false;
                this.textContent = '🔇';
                this.classList.add('muted');
            } else {
                audio.play().then(() => {
                    isMusicPlaying = true;
                    this.textContent = '🔊';
                    this.classList.remove('muted');
                }).catch(() => {
                    // tetap muted
                });
            }
        });
    }

    // ---------- 14. EFFECTS: HEART BURST ----------
    function triggerHeartBurst(cx, cy, count = 20) {
        const emojis = ['❤️', '💗', '💖', '💕', '♥️', '💘'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.textContent = randomItem(emojis);
            el.style.cssText = `
                    position: fixed;
                    left: ${cx}px;
                    top: ${cy}px;
                    font-size: ${randomBetween(16, 36)}px;
                    pointer-events: none;
                    z-index: 999;
                    user-select: none;
                    transition: all ${randomBetween(0.8, 1.6)}s cubic-bezier(0.2, 0.9, 0.4, 1.2);
                    opacity: 1;
                    transform: translate(0, 0) scale(0.5) rotate(0deg);
                `;
            document.body.appendChild(el);

            const angle = randomBetween(0, Math.PI * 2);
            const dist = randomBetween(40, 150);
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 60; // tendensi ke atas

            requestAnimationFrame(() => {
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1) rotate(${randomBetween(-30, 30)}deg)`;
                el.style.opacity = '0';
            });

            setTimeout(() => el.remove(), 1800);
        }
    }

    // ---------- 15. EFFECTS: CONFETTI ----------
    function triggerMiniConfetti() {
        const colors = ['#F3B8C2', '#D88998', '#F6C5A5', '#C9B7E8', '#B8C9B5', '#FFD700'];
        for (let i = 0; i < 40; i++) {
            const el = document.createElement('div');
            const size = randomBetween(4, 8);
            const color = randomItem(colors);
            const x = randomBetween(0, window.innerWidth);
            const y = randomBetween(-20, -10);
            const rot = randomBetween(0, 360);
            const duration = randomBetween(1.2, 2.4);

            el.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size * randomBetween(1.5, 3)}px;
                    background: ${color};
                    border-radius: 2px;
                    pointer-events: none;
                    z-index: 999;
                    transform: rotate(${rot}deg);
                    transition: all ${duration}s cubic-bezier(0.3, 0.8, 0.6, 1);
                    opacity: 1;
                `;
            document.body.appendChild(el);

            requestAnimationFrame(() => {
                el.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${rot + randomBetween(100, 300)}deg)`;
                el.style.opacity = '0';
            });

            setTimeout(() => el.remove(), duration * 1000 + 100);
        }
    }

    function triggerBigConfetti() {
        // Lebih banyak
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                const colors = ['#F3B8C2', '#D88998', '#F6C5A5', '#C9B7E8', '#B8C9B5', '#FFD700', '#FF8C00', '#FF6B8A'];
                const size = randomBetween(5, 10);
                const color = randomItem(colors);
                const x = randomBetween(0, window.innerWidth);
                const y = randomBetween(-30, -10);
                const rot = randomBetween(0, 360);
                const duration = randomBetween(1.8, 3.2);

                el.style.cssText = `
                        position: fixed;
                        left: ${x}px;
                        top: ${y}px;
                        width: ${size}px;
                        height: ${size * randomBetween(1.5, 3.5)}px;
                        background: ${color};
                        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                        pointer-events: none;
                        z-index: 999;
                        transform: rotate(${rot}deg);
                        transition: all ${duration}s cubic-bezier(0.15, 0.8, 0.3, 1);
                        opacity: 1;
                    `;
                document.body.appendChild(el);

                const driftX = randomBetween(-80, 80);
                requestAnimationFrame(() => {
                    el.style.transform =
                        `translate(${driftX}px, ${window.innerHeight + 150}px) rotate(${rot + randomBetween(200, 500)}deg)`;
                    el.style.opacity = '0';
                });

                setTimeout(() => el.remove(), duration * 1000 + 200);
            }, i * 12);
        }
    }

    // ---------- 16. EFFECTS: SPARKLE ----------
    function createSparkle(x, y) {
        const el = document.createElement('div');
        el.textContent = '✨';
        el.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: ${randomBetween(16, 32)}px;
                pointer-events: none;
                z-index: 999;
                transition: all 0.8s ease-out;
                opacity: 1;
                transform: scale(0.2) rotate(0deg);
            `;
        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.style.transform = `scale(1.4) rotate(180deg) translateY(-60px)`;
            el.style.opacity = '0';
        });

        setTimeout(() => el.remove(), 900);
    }

    // ---------- 17. TOUCH TRAIL (Hearts & Sparkles) ----------
    function setupTouchTrail() {
        let throttleTimer = null;

        function handleTap(e) {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
            }, 60);

            let clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // Random heart or sparkle
            if (Math.random() > 0.5) {
                const el = document.createElement('div');
                el.textContent = randomItem(['❤️', '💗', '✨', '⭐', '🌸']);
                el.style.cssText = `
                        position: fixed;
                        left: ${clientX}px;
                        top: ${clientY}px;
                        font-size: ${randomBetween(14, 28)}px;
                        pointer-events: none;
                        z-index: 999;
                        transition: all 0.9s ease-out;
                        opacity: 1;
                        transform: translate(0, 0) scale(0.5);
                    `;
                document.body.appendChild(el);

                const dx = randomBetween(-60, 60);
                const dy = randomBetween(-100, -20);
                requestAnimationFrame(() => {
                    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
                    el.style.opacity = '0';
                });

                setTimeout(() => el.remove(), 1000);
            }
        }

        document.addEventListener('touchstart', handleTap, { passive: true });
        document.addEventListener('mousedown', handleTap);
    }

    // ---------- 18. FLOATING HEARTS BACKGROUND (Opening) ----------
    function createFloatingHearts() {
        const container = document.querySelector('.opening-bg');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.textContent = randomItem(['♥', '♡', '❤', '💗']);
            const size = randomBetween(14, 32);
            const left = randomBetween(0, 100);
            const delay = randomBetween(0, 8);
            const duration = randomBetween(8, 16);
            const opacity = randomBetween(0.2, 0.5);

            heart.style.cssText = `
                    position: absolute;
                    left: ${left}%;
                    top: 100%;
                    font-size: ${size}px;
                    color: var(--soft-pink);
                    opacity: ${opacity};
                    animation: floatUp ${duration}s ${delay}s ease-in infinite;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                `;
            container.appendChild(heart);
        }

        // Tambahkan keyframe dinamis jika belum ada
        if (!document.getElementById('floatUpKeyframes')) {
            const style = document.createElement('style');
            style.id = 'floatUpKeyframes';
            style.textContent = `
                    @keyframes floatUp {
                        0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0.1; }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.6; }
                        100% { transform: translateY(-110vh) rotate(720deg) scale(1.2); opacity: 0; }
                    }
                `;
            document.head.appendChild(style);
        }
    }

    // ---------- 19. INITIALIZATION ----------
    function init() {
        // Setup semua fitur
        setupImageFallbacks();
        setupOpening();
        setupHero();
        setupCharacter();
        setupCountdown();
        setupMemories();
        setupLetter();
        setupCake();
        setupReasons();
        setupSecret();
        setupFinal();
        setupTouchTrail();

        // Background efek
        createFloatingHearts();

        // Tampilkan opening secara default
        showSection('opening');

        // Sembunyikan karakter interaktif di section lain, tapi posisi fixed
        // Karakter interaktif tetap muncul di semua section (kecuali opening, kita sembunyikan saat opening?)
        // Biarkan saja selalu ada, tapi kita bisa sembunyikan saat di opening (sudah diatur via z-index)
        // Atau kita biarkan dia muncul di atas opening? Lebih baik sembunyikan saat opening.
        // Kita handle via CSS: di #opening aktif, kita sembunyikan character-container.
        // Tapi karena kita pakai fixed, kita tambahkan aturan di CSS: #opening.active ~ .character-container { display: none; }
        // Karena tidak bisa sibling selector dengan ~, kita tambahkan class di body.
        // Cara simpel: kita hide/show via JS saat section berubah.
        function toggleCharacterVisibility() {
            const isOpeningActive = document.getElementById('opening').classList.contains('active');
            const charContainer = document.querySelector('.character-container');
            if (charContainer) {
                charContainer.style.display = isOpeningActive ? 'none' : 'flex';
            }
            // Music button tetap muncul di semua halaman
        }

        // Pantau perubahan section
        const observer = new MutationObserver(() => {
            toggleCharacterVisibility();
        });
        sections.forEach(sec => {
            observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
        });
        // Jalankan sekali
        setTimeout(toggleCharacterVisibility, 50);

        console.log('🎂 Birthday Website initialized! 💗');
        console.log(`🎉 Happy Birthday, ${birthdayConfig.name || 'Someone Special'}!`);
    }

    // Jalankan ketika DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();