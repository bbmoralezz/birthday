(() => {
  "use strict";

  const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  const treeApi = "https://api.github.com/repos/bbmoralezz/birthday/git/trees/main?recursive=1";
  const cacheKey = "birthday2026-image-manifest-v2";

  const readCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      return Array.isArray(cached) ? cached : [];
    } catch (_) {
      return [];
    }
  };

  const writeCache = images => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(images));
    } catch (_) {}
  };

  async function fetchTree() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${treeApi}&t=${Date.now()}`, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`GitHub tree request failed: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data?.tree)) {
        throw new Error("Invalid GitHub tree response");
      }

      if (data.truncated) {
        throw new Error("GitHub tree response was truncated");
      }

      return data.tree
        .filter(entry => (
          entry?.type === "blob" &&
          entry.path?.startsWith("2026/image/") &&
          imageExtensions.test(entry.path)
        ))
        .map(entry => entry.path.slice("2026/".length))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    } finally {
      clearTimeout(timeout);
    }
  }

  async function discoverImages() {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const images = [...new Set(await fetchTree())];
        if (!images.length) throw new Error("No images found in 2026/image");
        writeCache(images);
        return images;
      } catch (error) {
        if (attempt === 2) {
          console.warn("Unable to read 2026/image from GitHub; trying cached manifest.", error);
        }
      }
    }

    const cached = readCache();
    if (cached.length) return cached;

    return [];
  }

  window.birthday2026ImagesPromise = discoverImages()
    .then(images => {
      window.birthday2026Images = images;
      return images;
    });
})();
