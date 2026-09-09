const birthdayConfig = {
  name: "Yasmin Az Zahra'",
  birthday: "2026-09-20",
  mainPhoto: "image/1.png",
  music: "Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3",
  letter: `Happy Birthday!

Semoga di umur yang baru ini kamu selalu dikelilingi kebahagiaan, orang-orang baik, dan hal-hal indah.

Semoga setiap langkahmu membawa kamu lebih dekat kepada semua hal yang kamu impikan.

Stay happy.
Stay cute.
Always be yourself. 🤍`,
  memories: [
    { image: "image/1.png", caption: "A little moment worth keeping. 🌷" },
    { image: "image/2.png", caption: "One of many tiny memories. 💗" },
    { image: "image/3.png", caption: "This one deserves a place in the scrapbook. ✨" },
    { image: "image/4.png", caption: "A memory, pressed between these pages. 🤍" },
    { image: "image/5.png", caption: "Still cute. Still worth remembering. 🥺" },
    { image: "image/6.png", caption: "Another little piece of the story. 🎀" },
    { image: "image/8.png", caption: "A tiny memory from our little world. 🌸" },
    { image: "image/9.png", caption: "Keep this one close. 💖" },
    { image: "image/10.png", caption: "Just because this moment is precious. ✨" }
  ],
  emojiPool: ["🥰","😊","🥺","😆","😂","🤭","😳","👀","🐻","🐰","🐱","🐣","🧸","💗","💖","❤️","✨","🌷","🎀","🎂","🎈","🌸"],
  intensity: {
    calm: { spawnInterval: 2500, maxActive: 2, minDuration: 4000, maxDuration: 6000 },
    cute: { spawnInterval: 1800, maxActive: 4, minDuration: 3800, maxDuration: 6200 },
    playful: { spawnInterval: 1200, maxActive: 6, minDuration: 3400, maxDuration: 5800 },
    celebration: { spawnInterval: 650, maxActive: 10, minDuration: 3000, maxDuration: 5200 }
  }
};
