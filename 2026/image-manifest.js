(() => {
  "use strict";

  const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  const apiBase = "https://api.github.com/repos/bbmoralezz/birthday/contents/2026/image";
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
    "image/IMG-20260308-WA0080.jpg",
    "image/IMG-20260308-WA0117.jpg",
    "image/IMG-20260308-WA0118.jpg",
    "image/IMG-20260308-WA0122.jpg",
    "image/IMG-20260320-WA0101.jpg",
    "image/IMG-20260320-WA0140.jpg",
    "image/IMG-20260321-WA0012.jpg",
    "image/IMG-20260321-WA0071.jpg",
    "image/IMG-20260321-WA0072.jpg",
    "image/IMG-20260321-WA0224.jpg",
    "image/IMG-20260321-WA0304.jpg",
    "image/IMG-20260323-WA0007.jpg",
    "image/IMG-20260323-WA0028.jpg",
    "image/IMG-20260323-WA0187.jpg",
    "image/IMG-20260323-WA0191.jpg",
    "image/IMG-20260323-WA0192.jpg",
    "image/IMG-20260323-WA0196.jpg",
    "image/IMG-20260323-WA0199.jpg",
    "image/IMG-20260323-WA0217.jpg",
    "image/IMG-20260323-WA0483.jpg",
    "image/IMG-20260323-WA0487.jpg",
    "image/IMG-20260323-WA0489.jpg",
    "image/IMG-20260323-WA0494.jpg",
    "image/IMG-20260323-WA0496.jpg",
    "image/IMG-20260323-WA0497.jpg",
    "image/IMG-20260326-WA0107.jpg",
    "image/IMG-20260326-WA0209.jpg",
    "image/IMG-20260326-WA0217.jpg",
    "image/IMG-20260326-WA0284.jpg",
    "image/IMG-20260326-WA0285.jpg",
    "image/IMG-20260326-WA0286.jpg",
    "image/IMG-20260326-WA0290.jpg",
    "image/IMG-20260327-WA0289.jpg",
    "image/IMG-20260327-WA0302.jpg",
    "image/IMG-20260327-WA0318.jpg",
    "image/IMG-20260327-WA0321.jpg",
    "image/IMG-20260327-WA0338.jpg",
    "image/IMG-20260327-WA0340.jpg",
    "image/IMG-20260327-WA0343.jpg",
    "image/IMG-20260329-WA0055.jpg",
    "image/IMG-20260329-WA0137.jpg",
    "image/IMG-20260405-WA0059.jpg",
    "image/IMG-20260406-WA0013.jpg",
    "image/Screenshot_20260308-202440.jpg",
    "image/main.jpeg"
  ];

  const readCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem("birthday2026-image-manifest-v3") || "null");
      return Array.isArray(cached) ? cached : [];
    } catch (_) {
      return [];
    }
  };

  const writeCache = images => {
    try {
      localStorage.setItem("birthday2026-image-manifest-v3", JSON.stringify(images));
    } catch (_) {}
  };

  const sortImages = images => [...new Set(images)]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  async function discoverImages() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      try {
        const response = await fetch(`${apiBase}?ref=main&per_page=100`, {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`GitHub image directory request failed: ${response.status}`);

        const entries = await response.json();
        if (!Array.isArray(entries)) throw new Error("Invalid image directory response");

        const images = sortImages(entries
          .filter(entry => entry?.type === "file" && imageExtensions.test(entry.name || ""))
          .map(entry => `image/${encodeURIComponent(entry.name)}`));

        if (!images.length) throw new Error("No images found in 2026/image");

        writeCache(images);
        return images;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      const cached = sortImages(readCache());
      if (cached.length) {
        console.warn("Using cached 2026 image manifest after GitHub lookup failed.", error);
        return cached;
      }

      console.warn("Using bundled 2026 image manifest after GitHub lookup failed.", error);
      return sortImages(fallbackImages);
    }
  }

  window.birthday2026Images = sortImages(fallbackImages);
  window.birthday2026ImagesPromise = discoverImages().then(images => {
    window.birthday2026Images = images;
    return images;
  });
})();
