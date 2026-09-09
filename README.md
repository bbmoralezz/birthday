# 🎂 A Little World Made Just For You

Mobile-first interactive birthday surprise website built as a small digital scrapbook.

## 1. Run locally

Because the site loads a CSV with `fetch()`, use a local HTTP server instead of opening `index.html` directly.

Examples:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## 2. Change the name

Edit `birthday-config.js`:

```js
name: "Yasmin Az Zahra'"
```

## 3. Change the birthday

Use ISO format:

```js
birthday: "2026-09-20"
```

The date is shown on the hero card. Change the year/date whenever the surprise is reused.

## 4. Add your main photo

Put the photo in the repository and update:

```js
mainPhoto: "image/main-photo.webp"
```

Existing `image/*.png` files can be used as they are.

## 5. Add your music

Put an MP3 in the repository and update:

```js
music: "assets/music/birthday-song.mp3"
```

Music intentionally starts only after a user gesture because modern browsers commonly block unsolicited autoplay.

## 6. Edit the CSV messages

File:

`assets/messages/birthday-messages.csv`

Format:

```csv
category,message
greeting,"Happy Birthday! 🎂"
cute,"Jangan lupa senyum hari ini 🤍"
wish,"Semoga semua impianmu tercapai ✨"
romantic,"You are very special to me ❤️"
surprise,"Psst... masih ada kejutan 👀"
funny,"Umur boleh bertambah, tapi tetap cute 😆"
```

You can add hundreds of messages. The emoji engine remembers the most recent messages and avoids immediately repeating them.

## 7. Message categories

Supported categories used by the experience:

- `greeting` — opening/final
- `cute` — memories
- `wish` — cake
- `romantic` — letter/secret
- `surprise` — secret
- `funny` — general playful moments

If a requested category has no messages, the engine falls back to the complete CSV pool. If the CSV cannot be loaded, built-in fallback messages keep the site working.

## 8. Add emojis

Edit `emojiPool` in `birthday-config.js`:

```js
emojiPool: ["🥰", "🐰", "🐻", "💗", "✨", "🎀"]
```

Emoji are native Unicode characters, not PNG assets.

## 9. Adjust emoji intensity

Edit the `intensity` object in `birthday-config.js`:

```js
intensity: {
  calm: { spawnInterval: 2500, maxActive: 2, minDuration: 4000, maxDuration: 6000 },
  cute: { spawnInterval: 1800, maxActive: 4, minDuration: 3800, maxDuration: 6200 },
  playful: { spawnInterval: 1200, maxActive: 6, minDuration: 3400, maxDuration: 5800 },
  celebration: { spawnInterval: 650, maxActive: 10, minDuration: 3000, maxDuration: 5200 }
}
```

Lower `spawnInterval` = more frequent emoji. Higher `maxActive` = more emoji simultaneously.

## 10. Change theme colors

All visual colors live at the top of `styles.css`:

```css
--beige: #E8D5C4;
--cream: #FFF8F0;
--light-beige: #F7EFE7;
--pink: #F3B8C2;
--rose: #D88998;
--peach: #F6C5A5;
--brown: #8B6F61;
--lavender: #C9B7E8;
--sage: #B8C9B5;
```

Keep beige/cream dominant for the scrapbook feel.

## 11. Change personal messages

The main letter is in `birthday-config.js`:

```js
letter: `Happy Birthday!

Semoga di umur yang baru ini kamu selalu dikelilingi kebahagiaan...

Stay happy.
Stay cute.
Always be yourself. 🤍`
```

Speech-bubble messages belong in the CSV so they can be expanded without editing JavaScript.

## 12. Add memories

Add entries to `memories` in `birthday-config.js`:

```js
memories: [
  { image: "image/1.png", caption: "A little moment worth keeping. 🌷" },
  { image: "image/2.png", caption: "One of many tiny memories. 💗" }
]
```

The gallery automatically creates the cards and opens a full-screen viewer when a card is tapped.

## 13. GitHub Pages deployment

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select `main` and the root (`/`).
5. Save and wait for the Pages deployment.

The site is static and requires no server/database.

## 14. Project structure

```text
birthday/
├── index.html
├── styles.css
├── script.js
├── birthday-config.js
├── README.md
├── assets/
│   └── messages/
│       └── birthday-messages.csv
├── image/
│   └── existing personal images...
└── Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3
```

## 15. Design & performance notes

- Designed for 360–430px phones first, then scales up.
- Safe-area aware controls.
- Buttons use comfortable touch targets.
- Living emoji layer uses `pointer-events: none`.
- Emoji elements are removed after animation so the DOM does not grow forever.
- Animations favor `transform` and `opacity`.
- `prefers-reduced-motion` disables the living emoji layer and reduces motion.
- Missing photos use an inline fallback illustration.
- Missing CSV uses built-in messages.
- Missing personal configuration uses safe defaults.
