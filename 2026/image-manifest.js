(() => {
  "use strict";

  const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  const apiUrl = "https://api.github.com/repos/bbmoralezz/birthday/contents/2026/image?ref=main";

  const fallbackImages = [
    "image/1.jpeg",
    "image/2.jpeg",
    "image/3.jpg",
    "image/4.jpg",
    "image/5.jpg",
    "image/6.jpg",
    "image/7.jpg",
    "image/8.jpg",
    "image/9.jpg",
    "image/10.jpg",
    "image/11.jpg",
    "image/12.jpg",
    "image/13.jpg",
    "image/IMG-20260306-WA0060.jpg",
    "image/IMG-20260306-WA0063.jpg"
  ];

  async function discoverImages() {
    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`Image directory request failed: ${response.status}`);

      const entries = await response.json();
      const images = entries
        .filter(entry => entry?.type === "file" && imageExtensions.test(entry.name || ""))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
        .map(entry => `image/${encodeURIComponent(entry.name).replace(/%2F/g, "/")}`);

      if (images.length) return images;
    } catch (_) {
      // Use the last known list when the GitHub API is unavailable.
    }

    return fallbackImages;
  }

  window.birthday2026ImagesPromise = discoverImages().then(images => {
    window.birthday2026Images = [...new Set(images)];
    return window.birthday2026Images;
  });
})();
