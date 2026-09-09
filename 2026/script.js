(() => {
  "use strict";

  const config = window.birthdayConfig || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    musicStarted: false,
    celebrating: false,
    wishDone: false,
    secretDone: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
  };

  const bgMusic = $("#bgMusic");
  const musicSource = $("#musicSource");
  const musicToggle = $("#musicToggle");

  const safeConfig = {
    name: config.name || "You",
    birthday: config.birthday || "2026-09-20",
    mainPhoto: config.mainPhoto || "image/1.png",
    music: config.music || "Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3",
    letter: config.letter || "Happy Birthday!\n\nSemoga selalu bahagia, sehat, dan dikelilingi hal-hal baik. 🤍",
    memories: Array.isArray(config.memories) ? config.memories : []
  };

  const emojiAPI = () => window.emojiLoop;

  function updateMusicUI() {
    if (!bgMusic || !musicToggle) return;
    const playing = !bgMusic.paused;
    const icon = $("#musicIcon");
    const label = $("#musicLabel");
    if (icon) icon.textContent = playing ? "🎵" : "🔇";
    if (label) label.textContent = playing ? "Music on" : "Music off";
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
  }

  async function startMusic() {
    if (!bgMusic || state.musicStarted) return;
    try {
      await bgMusic.play();
      state.musicStarted = true;
      updateMusicUI();
    } catch (_) {}
  }

  async function toggleMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      try {
        await bgMusic.play();
        state.musicStarted = true;
      } catch (_) {}
    } else {
      bgMusic.pause();
    }
    updateMusicUI();
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
  }

  function setupPersonalization() {
    [$("#heroName"), $("#finalName"), $("#letterName")].forEach(el => {
      if (el) el.textContent = safeConfig.name;
    });

    const date = new Date(`${safeConfig.birthday}T00:00:00`);
    const birthdayText = $("#birthdayDateText");
    if (birthdayText) {
      birthdayText.textContent = Number.isNaN(date.getTime())
        ? safeConfig.birthday
        : date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    }

    if (musicSource) musicSource.src = safeConfig.music;
    if (bgMusic) bgMusic.load();

    const photo = $("#mainPhoto");
    if (photo) {
      photo.src = safeConfig.mainPhoto;
      photo.onerror = () => {
        photo.hidden = true;
        const fallback = $(".image-fallback", $("#mainPhotoCard"));
        if (fallback) fallback.hidden = false;
      };
    }

    const letterText = $("#letterText");
    if (letterText) letterText.textContent = safeConfig.letter;
  }

  function getConfiguredMemories() {
    return safeConfig.memories.filter(memory => memory && memory.image);
  }

  async function loadAllImagesFromFolder() {
    const configured = getConfiguredMemories();
    const configuredUrls = new Set(configured.map(memory => memory.image));
    const discovered = new Set();

    // GitHub Pages exposes the repository /image directory as a static path,
    // but browsers cannot list directory contents. The repository's image set
    // is therefore discovered from a manifest generated from the directory
    // when available, with configured memories retained as a fallback.
    try {
      const response = await fetch("../image/", { cache: "no-store" });
      if (response.ok) {
        const html = await response.text();
        const pattern = /href=["']([^"']+\.(?:png|jpe?g|webp|gif|avif))["']/gi;
        let match;
        while ((match = pattern.exec(html))) {
          const href = decodeURIComponent(match[1]);
          const filename = href.split("/").pop();
          if (filename && !filename.startsWith(".")) discovered.add(`../image/${filename}`);
        }
      }
    } catch (_) {}

    const all = new Map();
    configured.forEach(memory => all.set(memory.image, memory));
    discovered.forEach(url => {
      if (!all.has(url)) {
        all.set(url, {
          image: url,
          caption: `A little memory worth keeping. ✨`
        });
      }
    });

    // When a configured image is local to 2026 (for example 1.jpeg), retain it.
    return [...all.values()];
  }

  function renderMemories(memories) {
    const grid = $("#memoryGrid");
    if (!grid) return;
    grid.replaceChildren();

    memories.forEach((memory, index) => {
      const button = document.createElement("button");
      button.className = "memory-card";
      button.type = "button";
      button.setAttribute("aria-label", `Open memory ${index + 1}`);
      button.innerHTML = `<img src="${escapeHTML(memory.image)}" alt="Memory ${index + 1}" loading="lazy"><figcaption><span class="memory-number">${String(index + 1).padStart(2, "0")}</span> · ${escapeHTML(memory.caption || "A little memory.")}</figcaption>`;

      const img = $("img", button);
      img.addEventListener("error", () => {
        img.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600"><rect width="100%" height="100%" fill="#f3ded3"/><text x="50%" y="48%" text-anchor="middle" font-size="70">🌷</text><text x="50%" y="60%" text-anchor="middle" font-size="24" fill="#8b6f61">little memory</text></svg>`)}`;
      });
      button.addEventListener("click", () => openMemory(memory));
      grid.appendChild(button);
    });
  }

  async function buildMemories() {
    const memories = await loadAllImagesFromFolder();
    renderMemories(memories);
  }

  function openMemory(memory) {
    const viewer = $("#memoryViewer");
    const image = $("#viewerImage");
    const caption = $("#viewerCaption");
    if (!viewer || !image || !caption) return;
    image.src = memory.image;
    image.alt = memory.caption || "Memory";
    caption.textContent = memory.caption || "A little memory.";
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    emojiAPI()?.setIntensity("playful");
  }

  function closeMemory() {
    const viewer = $("#memoryViewer");
    if (viewer) viewer.hidden = true;
    document.body.style.overflow = "";
  }

  function setupLetter() {
    const button = $("#envelopeBtn");
    const card = $("#letterCard");
    if (!button || !card) return;

    button.addEventListener("click", () => {
      const opening = !button.classList.contains("open");
      button.classList.toggle("open", opening);
      button.setAttribute("aria-expanded", String(opening));
      if (opening) {
        card.hidden = false;
        emojiAPI()?.setIntensity("cute");
        setTimeout(() => card.scrollIntoView({
          behavior: state.reducedMotion ? "auto" : "smooth",
          block: "center"
        }), 450);
      } else {
        card.hidden = true;
      }
    });
  }

  function makeConfetti() {
    const canvas = $("#celebrationCanvas");
    if (!canvas || state.reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();

    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight * 0.4,
      vx: Math.random() * 2 - 1,
      vy: 2 + Math.random() * 4,
      r: Math.random() * Math.PI,
      s: 5 + Math.random() * 7,
      emoji: ["💗", "✨", "🎈", "🌸", "🎀"][Math.floor(Math.random() * 5)]
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.r += 0.05;
        ctx.font = `${p.s * 2}px serif`;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
        if (p.y > innerHeight + 30) {
          p.y = -30;
          p.x = Math.random() * innerWidth;
        }
      });
      frame++;
      if (frame < 500 && state.celebrating) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };

    draw();
    window.addEventListener("resize", resize, { once: true });
  }

  function wish() {
    if (state.wishDone) return;
    state.wishDone = true;

    const stage = $("#cakeStage");
    const message = $("#wishMessage");
    const button = $("#wishBtn");
    if (stage) stage.classList.add("wished");
    if (button) {
      button.disabled = true;
      button.textContent = "Wish made! 🤍";
    }

    if (message) {
      message.textContent = emojiAPI()?.pickMessage?.(["wish"]) || "Semoga semua impianmu tercapai ✨";
      message.hidden = false;
    }

    emojiAPI()?.setIntensity("playful");
    emojiAPI()?.burst?.({ category: "wish", count: 5, stagger: 120 });
    setTimeout(makeConfetti, 450);
  }

  function secret() {
    if (state.secretDone) return;
    state.secretDone = true;

    const sequence = $("#secretSequence");
    const button = $("#secretBtn");
    if (!sequence || !button) return;

    button.disabled = true;
    button.textContent = "The secret is open 🤍";
    sequence.hidden = false;

    emojiAPI()?.setIntensity("calm");
    emojiAPI()?.clear();

    const beats = $$(".secret-beat", sequence);
    const categories = ["surprise", "romantic", "greeting"];
    beats.forEach((beat, index) => {
      const paragraph = $("p", beat);
      if (paragraph) paragraph.textContent = emojiAPI()?.pickMessage?.([categories[index]]) || "🤍";
      setTimeout(() => beat.classList.add("show"), 650 + index * 1000);
    });

    setTimeout(() => $("#final")?.scrollIntoView({
      behavior: state.reducedMotion ? "auto" : "smooth"
    }), 4300);
  }

  function celebration() {
    if (state.celebrating) return;
    state.celebrating = true;
    document.body.classList.add("celebrating");
    emojiAPI()?.setIntensity("celebration");
    emojiAPI()?.burst?.({ count: 12, stagger: 180 });
    makeConfetti();
  }

  function replay() {
    state.celebrating = false;
    state.wishDone = false;
    state.secretDone = false;
    document.body.classList.remove("celebrating", "story-open");

    emojiAPI()?.reset?.();

    $("#storyContent").hidden = true;
    $("#opening").hidden = false;
    $("#envelopeBtn")?.classList.remove("open");
    $("#envelopeBtn")?.setAttribute("aria-expanded", "false");
    if ($("#letterCard")) $("#letterCard").hidden = true;
    $("#cakeStage")?.classList.remove("wished");

    const wishBtn = $("#wishBtn");
    if (wishBtn) {
      wishBtn.disabled = false;
      wishBtn.textContent = "Make a Wish ✨";
    }
    if ($("#wishMessage")) $("#wishMessage").hidden = true;

    const secretBtn = $("#secretBtn");
    if (secretBtn) {
      secretBtn.disabled = false;
      secretBtn.textContent = "Open The Secret ✨";
    }
    if ($("#secretSequence")) $("#secretSequence").hidden = true;
    $$(".secret-beat").forEach(x => x.classList.remove("show"));

    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
    state.musicStarted = false;
    updateMusicUI();
    window.scrollTo({ top: 0, behavior: state.reducedMotion ? "auto" : "smooth" });
  }

  function setupNavigation() {
    $("#openSurpriseBtn")?.addEventListener("click", revealStory);
    $$("[data-scroll]").forEach(btn => btn.addEventListener("click", () => {
      $("#" + btn.dataset.scroll)?.scrollIntoView({
        behavior: state.reducedMotion ? "auto" : "smooth"
      });
    }));
    $("#closeMemory")?.addEventListener("click", closeMemory);
    $("#memoryViewer")?.addEventListener("click", e => {
      if (e.target.id === "memoryViewer") closeMemory();
    });
    $("#wishBtn")?.addEventListener("click", wish);
    $("#secretBtn")?.addEventListener("click", secret);
    $("#replayBtn")?.addEventListener("click", replay);
    musicToggle?.addEventListener("click", toggleMusic);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeMemory();
    });
  }

  function setupEmojiEvents() {
    window.addEventListener("emoji-loop:intensity", event => {
      if (event.detail?.name === "celebration") celebration();
    });
  }

  function revealStory() {
    $("#opening").hidden = true;
    $("#storyContent").hidden = false;
    emojiAPI()?.setIntensity("cute");
    startMusic();
    document.body.classList.add("story-open");
    $("#hero")?.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth" });
  }

  async function init() {
    setupPersonalization();
    await buildMemories();
    setupLetter();
    setupNavigation();
    setupEmojiEvents();
    updateMusicUI();
  }

  init();
})();