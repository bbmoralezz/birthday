(() => {
  "use strict";

  const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;
  const apiBase = "https://api.github.com/repos/bbmoralezz/birthday/contents/2026/image";

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
      console.error("Unable to discover 2026 images:", error);
      window.birthday2026Images = [];
      return [];
    });
})();
