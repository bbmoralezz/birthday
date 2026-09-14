(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const grid = $("#memoryGrid");
  const viewer = $("#memoryViewer");
  const viewerImage = $("#viewerImage");
  const viewerCaption = $("#viewerCaption");
  const empty = $("#memoryEmpty");

  const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);

  const toPagePath = image => {
    const normalized = String(image || "").replace(/^\.\//, "");
    return normalized.startsWith("../") ? normalized : `../${normalized}`;
  };

  function openMemory(image, index) {
    viewerImage.src = toPagePath(image);
    viewerImage.alt = `Memory ${index + 1}`;
    viewerCaption.textContent = `memory ${String(index + 1).padStart(2, "0")}`;
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeMemory() {
    viewer.hidden = true;
    viewerImage.removeAttribute("src");
    document.body.style.overflow = "";
  }

  function buildGallery(images) {
    const uniqueImages = [...new Set((images || []).filter(Boolean))];
    grid.replaceChildren();

    if (!uniqueImages.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;

    uniqueImages.forEach((image, index) => {
      const button = document.createElement("button");
      button.className = "memory-card";
      button.type = "button";
      button.setAttribute("aria-label", `Open memory ${index + 1}`);
      button.innerHTML = `<img src="${escapeHTML(toPagePath(image))}" alt="Memory ${index + 1}" loading="lazy"><figcaption><span class="memory-number">${String(index + 1).padStart(2, "0")}</span> · 📸</figcaption>`;

      const img = button.querySelector("img");
      img.addEventListener("error", () => button.remove(), { once: true });
      button.addEventListener("click", () => openMemory(image, index));
      grid.appendChild(button);
    });
  }

  $("#closeMemory")?.addEventListener("click", closeMemory);
  viewer?.addEventListener("click", event => {
    if (event.target === viewer) closeMemory();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMemory();
  });

  async function init() {
    let images = window.birthday2026Images || [];
    try {
      if (window.birthday2026ImagesPromise) {
        images = await window.birthday2026ImagesPromise;
      }
    } catch (_) {}
    buildGallery(images);
  }

  init();
})();
