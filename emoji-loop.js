(() => {
  "use strict";

  const layer = document.getElementById("livingEmojiLayer");
  const config = window.birthdayConfig || {};
  if (!layer) return;

  const fallbackMessages = [
    { category: "greeting", message: "Happy Birthday! 🎂" },
    { category: "cute", message: "Jangan lupa senyum hari ini 🤍" },
    { category: "wish", message: "Semoga semua impianmu tercapai ✨" },
    { category: "romantic", message: "You are very special to me ❤️" },
    { category: "surprise", message: "Psst... masih ada kejutan 👀" },
    { category: "funny", message: "Umur boleh bertambah, tapi tetap cute 😆" }
  ];

  const emojiPool = Array.isArray(config.emojiPool) && config.emojiPool.length
    ? config.emojiPool
    : ["🥰","😊","🥺","😆","😂","🤭","😳","👀","🐻","🐰","🐱","🐣","🧸","💗","💖","❤️","✨","🌷","🎀","🎂","🎈","🌸"];

  const intensity = {
    calm: { interval: 2500, max: 2, minDuration: 5200, maxDuration: 7000 },
    cute: { interval: 1800, max: 4, minDuration: 5000, maxDuration: 6800 },
    playful: { interval: 1200, max: 6, minDuration: 4500, maxDuration: 6500 },
    celebration: { interval: 700, max: 10, minDuration: 4200, maxDuration: 6000 }
  };

  Object.keys(intensity).forEach(key => {
    if (config.intensity && config.intensity[key]) {
      intensity[key] = { ...intensity[key], ...config.intensity[key] };
    }
  });

  const state = {
    messages: fallbackMessages,
    recent: [],
    active: 0,
    timer: null,
    current: "calm",
    storyOpen: true,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false
  };

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && quoted && next === '"') {
        field += '"';
        i++;
        continue;
      }
      if (char === '"') {
        quoted = !quoted;
        continue;
      }
      if (char === "," && !quoted) {
        row.push(field.trim());
        field = "";
        continue;
      }
      if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i++;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = "";
        continue;
      }
      field += char;
    }

    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
    if (rows.length < 2) return [];

    const header = rows[0].map(value => value.toLowerCase());
    const categoryIndex = header.indexOf("category");
    const messageIndex = header.indexOf("message");
    if (messageIndex < 0) return [];

    return rows.slice(1)
      .map(values => ({
        category: values[categoryIndex] || "general",
        message: values[messageIndex] || ""
      }))
      .filter(item => item.message);
  }

  async function loadMessages() {
    try {
      const response = await fetch("assets/messages/birthday-messages.csv", { cache: "no-store" });
      if (!response.ok) throw new Error("CSV unavailable");
      const parsed = parseCSV(await response.text());
      if (parsed.length) state.messages = parsed;
    } catch (_) {
      // Keep the built-in fallback so the animation never depends on the CSV loading.
    }
  }

  function pickMessage(categories = []) {
    const wanted = new Set(categories);
    const filtered = wanted.size
      ? state.messages.filter(item => wanted.has(String(item.category).trim().toLowerCase()))
      : state.messages;
    const source = filtered.length ? filtered : state.messages.length ? state.messages : fallbackMessages;
    const available = source.filter(item => !state.recent.includes(item.message));
    const candidates = available.length ? available : source;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    state.recent.push(chosen.message);
    if (state.recent.length > 8) state.recent.shift();
    return chosen.message;
  }

  function safeSidePosition(side) {
    const compact = window.innerWidth <= 380;
    const minEdge = compact ? 5 : 6;
    const maxEdge = compact ? 31 : 34;
    const x = minEdge + Math.random() * (maxEdge - minEdge);
    const y = 13 + Math.random() * 72;
    return { x, y, side };
  }

  function cleanupForeignNodes() {
    layer.querySelectorAll(".emoji-bubble-wrap:not(.emoji-loop-owned)").forEach(node => node.remove());
  }

  function spawn(categories = []) {
    if (state.reducedMotion || !state.storyOpen) return;

    const cfg = intensity[state.current] || intensity.cute;
    if (state.active >= cfg.max) return;

    cleanupForeignNodes();

    const side = Math.random() < 0.5 ? "left" : "right";
    const pos = safeSidePosition(side);
    const duration = cfg.minDuration + Math.random() * (cfg.maxDuration - cfg.minDuration);
    const scale = 0.85 + Math.random() * 0.35;

    const wrapper = document.createElement("div");
    const emoji = document.createElement("span");
    const bubble = document.createElement("div");

    wrapper.className = "emoji-bubble-wrap emoji-loop-owned";
    emoji.className = "floating-emoji";
    bubble.className = `speech-bubble ${side === "left" ? "bubble-right" : "bubble-left"}`;

    emoji.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];
    bubble.textContent = pickMessage(categories);

    wrapper.style.left = side === "left" ? `${pos.x}%` : "auto";
    wrapper.style.right = side === "right" ? `${pos.x}%` : "auto";
    wrapper.style.top = `${pos.y}%`;
    wrapper.style.setProperty("--size", `${(1.5 + Math.random() * 0.75).toFixed(2)}rem`);
    wrapper.style.setProperty("--duration", `${duration}ms`);
    wrapper.style.setProperty("--drift", `${Math.round(Math.random() * 44 - 22)}px`);
    wrapper.style.setProperty("--rotation", `${Math.round(Math.random() * 14 - 7)}deg`);
    emoji.style.transform = `scale(${scale.toFixed(2)})`;

    wrapper.append(emoji, bubble);
    layer.appendChild(wrapper);
    state.active++;

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      if (wrapper.isConnected) wrapper.remove();
      state.active = Math.max(0, state.active - 1);
    };

    wrapper.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, duration + 1000);
  }

  function restartLoop() {
    clearInterval(state.timer);
    state.timer = null;
    if (state.reducedMotion) return;

    const cfg = intensity[state.current] || intensity.cute;
    // Keep the loop independent from scrolling and clicks.
    spawn();
    state.timer = setInterval(spawn, cfg.interval);
  }

  function setIntensity(name) {
    if (!intensity[name]) name = "cute";
    state.current = name;
    restartLoop();
  }

  function watchSections() {
    if (!("IntersectionObserver" in window)) return;

    const sections = document.querySelectorAll(".story-section[data-intensity]");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setIntensity(entry.target.dataset.intensity || "cute");
      });
    }, { threshold: 0.45 });

    sections.forEach(section => observer.observe(section));
  }

  // Remove nodes from the old engine if it tries to spawn alongside this loop.
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (!mutation.addedNodes.length) continue;
      cleanupForeignNodes();
      break;
    }
  });
  observer.observe(layer, { childList: true });

  // Always keep the living layer running. The opening page is calm; opening the story
  // and entering later sections changes intensity rather than starting/stopping the loop.
  setIntensity("calm");
  watchSections();
  loadMessages();
})();
