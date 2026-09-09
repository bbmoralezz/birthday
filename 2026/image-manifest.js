(() => {
  "use strict";

  const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  const apiBase = "https://api.github.com/repos/bbmoralezz/birthday/contents/2026/image";

  // Static fallback keeps Memories working when the GitHub API is unavailable.
  // New images are still discovered automatically whenever the API request succeeds.
  const fallbackImages = [
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
    "image/IMG-20260306-WA0063.jpg",
    "image/IMG-20260308-WA0080.jpg"
  ];

  async function discoverImages() {
    const entries = [];

    for (let page = 1; page <= 10; page += 1) {
      const response = await fetch(`${apiBase}?ref=main&per_page=100&page=${page}`, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store"
      });

      if (!response.ok) throw new Error(`Image directory request failed: ${response.status}`);

      const pageEntries = await response.json();
      if (!Array.isArray(pageEntries)) throw new Error("Invalid image directory response");

      entries.push(...pageEntries);
      if (pageEntries.length < 100) break;
    }

    const images = entries
      .filter(entry => entry?.type === "file" && imageExtensions.test(entry.name || ""))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
      .map(entry => `image/${encodeURIComponent(entry.name).replace(/%2F/g, "/")}`);

    if (!images.length) throw new Error("No images found in 2026/image");
    return [...new Set(images)];
  }

  window.birthday2026ImagesPromise = discoverImages()
    .then(images => {
      window.birthday2026Images = images;
      return images;
    })
    .catch(error => {
      console.warn("Unable to discover 2026 images from GitHub API; using fallback list.", error);
      window.birthday2026Images = [...fallbackImages];
      return window.birthday2026Images;
    });
})();
