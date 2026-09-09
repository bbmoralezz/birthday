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
    : ["🥰", "😊", "🥺", "😆", "😂", "🤭", "😳", "👀", "🐻", "🐰", "🐱", "🐣", "🧸", "💗", "💖", "❤️", "✨", "🌷", "🎀", "🎂", "🎈", "🌸"];

  const defaults = {
    calm: { interval: 2500, max: 2, minDuration: 5200, maxDuration: 7000 },
    cute: { interval: 1800, max: 4, minDuration: 5000, maxDuration: 6800 },
    playful: { interval: 1200, max: 6, minDuration: 4500, maxDuration: 6500 },
    celebration: { interval: 700, max: 10, minDuration: 4200, maxDuration: 6000 }
  };

  const rawIntensity = config.intensity || {};
  const intensity = Object.fromEntries(Object.entries(defaults).map(([name, base]) => {
    const override = rawIntensity[name] || {};
    return [name, {
      ...base,
      ...override,
      interval: override.interval ?? override.spawnInterval ?? base.interval,
      max: override.max ?? override.maxActive ?? base.max,
      minDuration: override.minDuration ?? base.minDuration,
      maxDuration: override.maxDuration ?? base.maxDuration
    }];
  }));

  const state = {
    messages: fallbackMessages,
    recent: [],
    active: 0,
    timer: null,
    current: "calm",
    running: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false,
    nodes: new Set(),
    timeouts: new Set(),
    intensityObserver: null
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
      // Fallback messages keep the animation independent from network availability.
    }
  }

  function pickMessage(categories = []) {
    const wanted = new Set(categories.map(value => String(value).trim().toLowerCase()));
    const filtered = wanted.size
      ? state.messages.filter(item => wanted.has(String(item.category).trim().toLowerCase()))
      : state.messages;
    const source = filtered.length ? filtered : (state.messages.length ? state.messages : fallbackMessages);
    const available = source.filter(item => !state.recent.includes(item.message));
    const candidates = available.length ? available : source;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    state.recent.push(chosen.message);
    if (state.recent.length > Math.min(8, source.length)) state.recent.shift();
    return chosen.message;
  }

  function safePosition() {
    const compact = window.innerWidth <= 380;
    const minEdge = compact ? 5 : 6;
    const maxEdge = compact ? 31 : 34;
    return {
      side: Math.random() < 0.5 ? "left" : "right",
      x: minEdge + Math.random() * (maxEdge - minEdge),
      y: 13 + Math.random() * 72
    };
  }

  function clearTimeoutHandle(handle) {
    if (!handle) return;
    window.clearTimeout(handle);
    state.timeouts.delete(handle);
  }

  function removeNode(wrapper) {
    if (!wrapper || !state.nodes.has(wrapper)) return;
    state.nodes.delete(wrapper);
    if (wrapper.isConnected) wrapper.remove();
    state.active = Math.max(0, state.active - 1);
    const timeout = wrapper.__emojiLoopTimeout;
    wrapper.__emojiLoopTimeout = null;
    if (timeout) clearTimeoutHandle(timeout);
  }

  function spawn(categories = [], options = {}) {
    if (state.reducedMotion || !state.running) return false;

    const cfg = intensity[state.current] || intensity.cute;
    if (!options.force && state.active >= cfg.max) return false;

    const pos = safePosition();
    const duration = options.duration ?? (cfg.minDuration + Math.random() * (cfg.maxDuration - cfg.minDuration));
    const scale = 0.85 + Math.random() * 0.35;
    const wrapper = document.createElement("div");
    const emoji = document.createElement("span");
    const bubble = document.createElement("div");

    wrapper.className = "emoji-bubble-wrap emoji-loop-owned";
    emoji.className = "floating-emoji";
    bubble.className = `speech-bubble ${pos.side === "left" ? "bubble-right" : "bubble-left"}`;
    emoji.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];
    bubble.textContent = pickMessage(categories);

    wrapper.style.left = pos.side === "left" ? `${pos.x}%` : "auto";
    wrapper.style.right = pos.side === "right" ? `${pos.x}%` : "auto";
    wrapper.style.top = `${pos.y}%`;
    wrapper.style.setProperty("--size", `${(1.5 + Math.random() * 0.75).toFixed(2)}rem`);
    wrapper.style.setProperty("--duration", `${duration}ms`);
    wrapper.style.setProperty("--drift", `${Math.round(Math.random() * 44 - 22)}px`);
    wrapper.style.setProperty("--rotation", `${Math.round(Math.random() * 14 - 7)}deg`);
    emoji.style.transform = `scale(${scale.toFixed(2)})`;

    wrapper.append(emoji, bubble);
    layer.appendChild(wrapper);
    state.nodes.add(wrapper);
    state.active++;

    const remove = event => {
      // animationend bubbles from floating-emoji and speech-bubble. Only the
      // wrapper's own float animation may end its lifecycle.
      if (event && (event.target !== wrapper || event.animationName !== "emojiFloat")) return;
      removeNode(wrapper);
    };
    wrapper.addEventListener("animationend", remove);
    const timeout = window.setTimeout(() => removeNode(wrapper), duration + 1200);
    wrapper.__emojiLoopTimeout = timeout;
    state.timeouts.add(timeout);
    return true;
  }

  function clear() {
    for (const timeout of [...state.timeouts]) clearTimeoutHandle(timeout);
    for (const node of [...state.nodes]) {
      if (node.isConnected) node.remove();
    }
    state.nodes.clear();
    state.active = 0;
    layer.querySelectorAll(".emoji-bubble-wrap.emoji-loop-owned").forEach(node => node.remove());
  }

  function stop() {
    state.running = false;
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
  }

  function start() {
    if (state.reducedMotion) return;
    state.running = true;
    restartTimer();
  }

  function restartTimer() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    if (!state.running || state.reducedMotion) return;

    const cfg = intensity[state.current] || intensity.cute;
    state.timer = window.setInterval(() => spawn(), Math.max(250, cfg.interval));
  }

  function setIntensity(name) {
    const next = intensity[name] ? name : "cute";
    const changed = state.current !== next;
    state.current = next;
    if (!state.running) start();
    if (changed) restartTimer();

    if (state.running && state.active === 0) spawn();
    if (changed) {
      window.dispatchEvent(new CustomEvent("emoji-loop:intensity", {
        detail: { name: next }
      }));
    }
  }

  function burst({ category = null, count = 1, stagger = 0 } = {}) {
    if (state.reducedMotion || !state.running) return;
    const total = Math.max(0, Math.floor(count));
    for (let i = 0; i < total; i++) {
      if (stagger <= 0) {
        spawn(category ? [category] : [], { force: true });
        continue;
      }
      const handle = window.setTimeout(() => {
        state.timeouts.delete(handle);
        if (state.running) spawn(category ? [category] : [], { force: true });
      }, i * stagger);
      state.timeouts.add(handle);
    }
  }

  function reset() {
    stop();
    clear();
    state.recent = [];
    state.current = "calm";
    start();
    spawn();
  }

  function setupSectionObserver() {
    if (!("IntersectionObserver" in window) || state.intensityObserver) return;

    const sections = document.querySelectorAll(".story-section[data-intensity]");
    state.intensityObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setIntensity(visible.target.dataset.intensity || "cute");
    }, { threshold: [0.2, 0.35, 0.5, 0.7] });

    sections.forEach(section => state.intensityObserver.observe(section));
  }

  function exposeAPI() {
    window.emojiLoop = Object.freeze({
      start,
      stop,
      reset,
      clear,
      spawn,
      burst,
      setIntensity,
      pickMessage,
      getState: () => ({
        active: state.active,
        running: state.running,
        intensity: state.current
      })
    });
  }

  exposeAPI();
  setupSectionObserver();
  start();
  spawn();
  loadMessages();
})();