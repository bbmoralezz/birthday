(() => {
  "use strict";

  const config = window.birthdayConfig || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const fallbackMessages = [
    { category: "greeting", message: "Happy Birthday! 🎂" },
    { category: "cute", message: "Jangan lupa senyum hari ini 🤍" },
    { category: "wish", message: "Semoga semua impianmu tercapai ✨" },
    { category: "romantic", message: "You are very special to me ❤️" },
    { category: "surprise", message: "Psst... masih ada kejutan 👀" },
    { category: "funny", message: "Umur boleh bertambah, tapi tetap cute 😆" }
  ];

  const state = {
    messages: fallbackMessages,
    recentMessages: [],
    activeEmojis: 0,
    spawnTimer: null,
    currentIntensity: "calm",
    musicStarted: false,
    celebrating: false,
    wishDone: false,
    secretDone: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
  };

  const layer = $("#livingEmojiLayer");
  const bgMusic = $("#bgMusic");
  const musicSource = $("#musicSource");
  const musicToggle = $("#musicToggle");

  const safeConfig = {
    name: config.name || "You",
    birthday: config.birthday || "2026-09-20",
    mainPhoto: config.mainPhoto || "image/1.png",
    music: config.music || "Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3",
    letter: config.letter || "Happy Birthday!\n\nSemoga selalu bahagia, sehat, dan dikelilingi hal-hal baik. 🤍",
    memories: Array.isArray(config.memories) && config.memories.length ? config.memories : [
      { image: "image/1.png", caption: "A little memory worth keeping. 🌷" },
      { image: "image/2.png", caption: "One of many tiny memories. 💗" },
      { image: "image/3.png", caption: "This one deserves a place in the scrapbook. ✨" }
    ],
    emojiPool: Array.isArray(config.emojiPool) && config.emojiPool.length ? config.emojiPool : ["🥰","😊","🥺","😆","🤭","👀","🐻","🐰","🧸","💗","❤️","✨","🌷","🎀","🎂","🎈","🌸"],
    intensity: config.intensity || {}
  };

  function getIntensity(name = "cute") {
    const defaults = {
      calm: { spawnInterval: 2500, maxActive: 2, minDuration: 4000, maxDuration: 6000 },
      cute: { spawnInterval: 1800, maxActive: 4, minDuration: 3800, maxDuration: 6200 },
      playful: { spawnInterval: 1200, maxActive: 6, minDuration: 3400, maxDuration: 5800 },
      celebration: { spawnInterval: 650, maxActive: 10, minDuration: 3000, maxDuration: 5200 }
    };
    return { ...defaults[name] || defaults.cute, ...(safeConfig.intensity[name] || {}) };
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i + 1];
      if (c === '"' && quoted && next === '"') { field += '"'; i++; continue; }
      if (c === '"') { quoted = !quoted; continue; }
      if (c === ',' && !quoted) { row.push(field.trim()); field = ""; continue; }
      if ((c === '\n' || c === '\r') && !quoted) {
        if (c === '\r' && next === '\n') i++;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = []; field = ""; continue;
      }
      field += c;
    }
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
    if (rows.length < 2) return [];
    const header = rows[0].map(x => x.toLowerCase());
    const categoryIndex = header.indexOf("category"), messageIndex = header.indexOf("message");
    if (messageIndex < 0) return [];
    return rows.slice(1).map(r => ({ category: r[categoryIndex] || "general", message: r[messageIndex] || "" })).filter(x => x.message);
  }

  async function loadMessages() {
    try {
      const response = await fetch("assets/messages/birthday-messages.csv", { cache: "no-store" });
      if (!response.ok) throw new Error("CSV unavailable");
      const parsed = parseCSV(await response.text());
      if (parsed.length) state.messages = parsed;
    } catch (error) {
      console.info("Using built-in birthday messages.");
    }
  }

  function pickMessage(categories = []) {
    const wanted = new Set(categories);
    const pool = wanted.size ? state.messages.filter(m => wanted.has(m.category)) : state.messages;
    const source = pool.length ? pool : state.messages.length ? state.messages : fallbackMessages;
    const available = source.filter(m => !state.recentMessages.includes(m.message));
    const candidates = available.length ? available : source;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    state.recentMessages.push(chosen.message);
    if (state.recentMessages.length > 6) state.recentMessages.shift();
    return chosen.message;
  }

  function updateMusicUI() {
    const playing = !bgMusic.paused;
    $("#musicIcon").textContent = playing ? "🎵" : "🔇";
    $("#musicLabel").textContent = playing ? "Music on" : "Music off";
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
  }

  async function startMusic() {
    if (!bgMusic || state.musicStarted) return;
    try { await bgMusic.play(); state.musicStarted = true; updateMusicUI(); } catch (_) { /* browser requires another gesture */ }
  }

  async function toggleMusic() {
    if (bgMusic.paused) {
      try { await bgMusic.play(); state.musicStarted = true; } catch (_) {}
    } else bgMusic.pause();
    updateMusicUI();
  }

  function clearEmojiLayer() {
    if (!layer) return;
    layer.replaceChildren();
    state.activeEmojis = 0;
  }

  function randomPosition() {
    // Keep the center column clear so primary content remains readable.
    const side = Math.random() < .5 ? "left" : "right";
    return {
      side,
      x: 4 + Math.random() * 20,
      y: 12 + Math.random() * 76
    };
  }

  function spawnEmoji(forceCategory = null) {
    if (state.reducedMotion || !layer) return;
    const cfg = getIntensity(state.currentIntensity);
    if (state.activeEmojis >= cfg.maxActive) return;

    const wrapper = document.createElement("div");
    wrapper.className = "emoji-bubble-wrap";
    const emoji = document.createElement("span");
    emoji.className = "floating-emoji";
    emoji.textContent = safeConfig.emojiPool[Math.floor(Math.random() * safeConfig.emojiPool.length)];

    const pos = randomPosition();
    const scale = (cfg.minScale || .8) + Math.random() * ((cfg.maxScale || 1.3) - (cfg.minScale || .8));
    const duration = cfg.minDuration + Math.random() * (cfg.maxDuration - cfg.minDuration);
    const drift = (Math.random() * 60 - 30).toFixed(0) + "px";
    const rotation = (Math.random() * 20 - 10).toFixed(0) + "deg";
    wrapper.style.left = pos.side === "left" ? pos.x + "%" : "auto";
    wrapper.style.right = pos.side === "right" ? pos.x + "%" : "auto";
    wrapper.style.top = pos.y + "%";
    wrapper.style.setProperty("--size", (1.6 + Math.random() * .9).toFixed(2) + "rem");
    wrapper.style.setProperty("--duration", duration + "ms");
    wrapper.style.setProperty("--drift", drift);
    wrapper.style.setProperty("--rotation", rotation);
    emoji.style.transform = `scale(${scale})`;

    const bubble = document.createElement("div");
    bubble.className = `speech-bubble ${pos.side === "left" ? "bubble-right" : "bubble-left"}`;
    bubble.textContent = pickMessage(forceCategory ? [forceCategory] : []);
    wrapper.append(emoji, bubble);
    layer.appendChild(wrapper);
    state.activeEmojis++;

    const remove = () => {
      if (!wrapper.isConnected) return;
      wrapper.remove();
      state.activeEmojis = Math.max(0, state.activeEmojis - 1);
    };
    wrapper.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, duration + 700);
  }

  function setIntensity(name) {
    if (state.currentIntensity === name) return;
    state.currentIntensity = name;
    clearInterval(state.spawnTimer);
    const cfg = getIntensity(name);
    if (!state.reducedMotion) {
      state.spawnTimer = setInterval(() => spawnEmoji(), cfg.spawnInterval);
      spawnEmoji();
    }
  }

  function startEmojiEngine() {
    setIntensity("calm");
  }

  function revealStory() {
    $("#opening").hidden = true;
    $("#storyContent").hidden = false;
    setIntensity("cute");
    startMusic();
    document.body.classList.add("story-open");
    $("#hero").scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth" });
  }

  function setupPersonalization() {
    [$("#heroName"), $("#finalName"), $("#letterName")].forEach(el => { if (el) el.textContent = safeConfig.name; });
    const date = new Date(`${safeConfig.birthday}T00:00:00`);
    $("#birthdayDateText").textContent = Number.isNaN(date.getTime()) ? safeConfig.birthday : date.toLocaleDateString("en-US", { day:"numeric", month:"long", year:"numeric" });
    if (musicSource) musicSource.src = safeConfig.music;
    if (bgMusic) bgMusic.load();
    const photo = $("#mainPhoto");
    photo.src = safeConfig.mainPhoto;
    photo.onerror = () => { photo.hidden = true; $(".image-fallback", $("#mainPhotoCard")).hidden = false; };
    $("#letterText").textContent = safeConfig.letter;
  }

  function buildMemories() {
    const grid = $("#memoryGrid");
    if (!grid) return;
    grid.replaceChildren();
    safeConfig.memories.forEach((memory, index) => {
      const button = document.createElement("button");
      button.className = "memory-card";
      button.type = "button";
      button.setAttribute("aria-label", `Open memory ${index + 1}`);
      button.innerHTML = `<img src="${escapeHTML(memory.image)}" alt="Memory ${index + 1}" loading="lazy"><figcaption><span class="memory-number">${String(index + 1).padStart(2,"0")}</span> · ${escapeHTML(memory.caption || "A little memory.")}</figcaption>`;
      const img = $("img", button);
      img.addEventListener("error", () => { img.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600"><rect width="100%" height="100%" fill="#f3ded3"/><text x="50%" y="48%" text-anchor="middle" font-size="70">🌷</text><text x="50%" y="60%" text-anchor="middle" font-size="24" fill="#8b6f61">little memory</text></svg>`)}`; });
      button.addEventListener("click", () => openMemory(memory));
      grid.appendChild(button);
    });
  }

  function openMemory(memory) {
    const viewer = $("#memoryViewer"), image = $("#viewerImage"), caption = $("#viewerCaption");
    image.src = memory.image; image.alt = memory.caption || "Memory"; caption.textContent = memory.caption || "A little memory.";
    viewer.hidden = false; document.body.style.overflow = "hidden"; setIntensity("playful");
  }

  function closeMemory() { $("#memoryViewer").hidden = true; document.body.style.overflow = ""; }

  function setupLetter() {
    const button = $("#envelopeBtn"), card = $("#letterCard");
    button.addEventListener("click", () => {
      const opening = !button.classList.contains("open");
      button.classList.toggle("open", opening); button.setAttribute("aria-expanded", String(opening));
      if (opening) {
        card.hidden = false; setIntensity("cute");
        setTimeout(() => card.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth", block:"center" }), 450);
      } else card.hidden = true;
    });
  }

  function makeConfetti() {
    const canvas = $("#celebrationCanvas"), ctx = canvas.getContext("2d");
    if (!canvas || state.reducedMotion) return;
    const resize = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); };
    resize();
    const pieces = Array.from({ length: 90 }, () => ({ x: Math.random()*innerWidth, y: -20-Math.random()*innerHeight*.4, vx: Math.random()*2-1, vy: 2+Math.random()*4, r: Math.random()*Math.PI, s: 5+Math.random()*7, emoji: ["💗","✨","🎈","🌸","🎀"][Math.floor(Math.random()*5)] }));
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0,0,innerWidth,innerHeight);
      pieces.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += .05; ctx.font = `${p.s*2}px serif`; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillText(p.emoji,0,0); ctx.restore(); if (p.y > innerHeight+30) { p.y=-30; p.x=Math.random()*innerWidth; } });
      frame++; if (frame < 500 && state.celebrating) requestAnimationFrame(draw); else ctx.clearRect(0,0,innerWidth,innerHeight);
    };
    draw();
    window.addEventListener("resize", resize, { once: true });
  }

  function wish() {
    if (state.wishDone) return;
    state.wishDone = true;
    const stage = $("#cakeStage"), message = $("#wishMessage"), button = $("#wishBtn");
    stage.classList.add("wished"); button.disabled = true; button.textContent = "Wish made! 🤍";
    message.textContent = pickMessage(["wish"]);
    message.hidden = false;
    setIntensity("playful");
    for (let i=0;i<5;i++) setTimeout(() => spawnEmoji("wish"), i*120);
    setTimeout(() => makeConfetti(), 450);
  }

  function secret() {
    if (state.secretDone) return;
    state.secretDone = true;
    const sequence = $("#secretSequence"), button = $("#secretBtn");
    button.disabled = true; button.textContent = "The secret is open 🤍"; sequence.hidden = false;
    setIntensity("calm"); clearEmojiLayer();
    const beats = $$(".secret-beat", sequence);
    beats[0].querySelector("p").textContent = pickMessage(["surprise"]);
    beats[1].querySelector("p").textContent = pickMessage(["romantic"]);
    beats[2].querySelector("p").textContent = pickMessage(["greeting"]);
    beats.forEach((beat, i) => setTimeout(() => beat.classList.add("show"), 650 + i*1000));
    setTimeout(() => $("#final").scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth" }), 4300);
  }

  function celebration() {
    if (state.celebrating) return;
    state.celebrating = true; document.body.classList.add("celebrating"); setIntensity("celebration"); makeConfetti();
    for (let i=0;i<12;i++) setTimeout(() => spawnEmoji(), i*180);
  }

  function replay() {
    state.celebrating = false; state.wishDone = false; state.secretDone = false; state.recentMessages = [];
    document.body.classList.remove("celebrating", "story-open"); clearEmojiLayer();
    $("#storyContent").hidden = true; $("#opening").hidden = false;
    $("#envelopeBtn").classList.remove("open"); $("#envelopeBtn").setAttribute("aria-expanded","false"); $("#letterCard").hidden = true;
    $("#cakeStage").classList.remove("wished"); $("#wishBtn").disabled = false; $("#wishBtn").textContent = "Make a Wish ✨"; $("#wishMessage").hidden = true;
    $("#secretBtn").disabled = false; $("#secretBtn").textContent = "Open The Secret ✨"; $("#secretSequence").hidden = true; $$(".secret-beat").forEach(x => x.classList.remove("show"));
    bgMusic.pause(); bgMusic.currentTime = 0; state.musicStarted = false; updateMusicUI();
    window.scrollTo({ top: 0, behavior: state.reducedMotion ? "auto" : "smooth" }); startEmojiEngine();
  }

  function setupNavigation() {
    $("#openSurpriseBtn").addEventListener("click", revealStory);
    $$("[data-scroll]").forEach(btn => btn.addEventListener("click", () => $("#" + btn.dataset.scroll)?.scrollIntoView({ behavior: state.reducedMotion ? "auto" : "smooth" })));
    $("#closeMemory").addEventListener("click", closeMemory); $("#memoryViewer").addEventListener("click", e => { if (e.target.id === "memoryViewer") closeMemory(); });
    $("#wishBtn").addEventListener("click", wish); $("#secretBtn").addEventListener("click", secret); $("#replayBtn").addEventListener("click", replay); musicToggle.addEventListener("click", toggleMusic);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMemory(); });
    document.addEventListener("click", e => { if (!state.reducedMotion && !e.target.closest("button,input,textarea,a")) spawnEmoji(); }, { passive: true });
  }

  function setupSectionIntensity() {
    const sections = $$(".story-section[data-intensity]");
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { setIntensity(entry.target.dataset.intensity); if (entry.target.id === "final") celebration(); } }), { threshold: .35 });
    sections.forEach(section => observer.observe(section));
  }

  async function init() {
    setupPersonalization(); buildMemories(); setupLetter(); setupNavigation(); startEmojiEngine();
    await loadMessages(); setupSectionIntensity(); updateMusicUI();
  }

  init();
})();
