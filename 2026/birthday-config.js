window.birthdayConfig = {
  name: "Yasmin Az Zahra'",
  birthday: "2006-09-10",
  mainPhoto: "main.jpeg",
  secretImage: "pp.jpg",
  secretCaption: "wleee😛",
  music: "Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3",
  letter: `HAPPY BIRTHDAY JARAAAAAA🥳🥳🥳🥳🥳

  CIEHH UDAH 20 TAHUN COOOOYYY
  BLIO SUDAH KEPALA 2 LOH YA😱😱😱😱

  🥳🥳🥳🥳🥳🥳🥳🦢🦢🦢🦢🦢🦢😝😝😝😝🤭🤭🤭🤭🤭🤭😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😶‍🌫️😱😱🤯🤯🤯🥳🥳🥳🥳🤩🤩🤩🤩😌😌😌🫨🫨🫨🫨😯😯😯😸😸😸😼😼😼👀👀👁️🧕🏻🧕🏻🧏‍♂️🧏🧏‍♀️🤳🤳🤳🤳🤳

semoga jara panjang umuurr, sehat teruuss dan bisa gapai cita cita di kepala 2 inih😼😼😼😼
AAAAAAAAAAAAAAAAAAAAAMMMMMIIIIIIIIIIIIIIIIIIIINNNNNNNNNNNNNNNNNN

dd dd ini sudah gede gais🥺🥺🥹🥹🥹🥹🥹🥹🥹,
im truly soo proud of her soooo much much muchhhhhh

jara uda gede, dan udah dewasa, jadiiii kurangin begadangnya yaaa, mam yang teratur selaluuu, jaga kesehatann, yang rajin minum TTD nyaa, kurangin skrolingnyaa okeyyyy

iyadehh no more panggil dd dd, kamu udah tante tante yah sekarang omaygatt ngerinyoo😱🥶🥶🥶

tapiiii kalo kamu bandel dan nakal berati masi dd dd n bocil kecil badung, biarin aku bakal panggil bocil terus kalo bandel... jangan bandel😡😡

selamat menempuh lembaran baru di level ke 20 ini yaaa jara cantikk maniss imup qiyutt🥳🥳🥳

glad i'm still here watching u grow up🥺`,
  memories: [],
  emojiPool: ["🐵", "🙊", "🙉", "🙈", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👽", "👻", "😈", "👺", "🫣", "🧐", "👾", "🐶", "🐺", "🐱", "🦁", "🐯", "🦊", "🦝", "🐮", "🐷", "🐗", "🐭", "🐹", "🐰", "🐻", "🐻‍❄️", "🐨", "🐼", "🐸", "🦓", "👩", "👨", "🧑", "👧", "👦", "🧒", "👶", "👵", "👴", "🧓", "👩‍🦰", "👨‍🦰", "🧑‍🦰", "👩‍🦱", "👨‍🦱", "🧑‍🦱", "👩‍🦲", "👨‍🦲", "🧑‍🦲", "👩‍🦳", "👨‍🦳", "🧑‍🦳", "👱‍♀️", "👱‍♂️", "👱", "👸", "🫅", "🤴", "👳‍♀️", "👳‍♂️", "👳", "👲", "🧔", "🧔‍♂️", "🧔‍♀️", "👼", "🤶", "🎅", "🧑‍🎄", "👮‍♀️", "👮‍♂️", "👮", "🕵️‍♀️", "🕵️‍♂️", "🕵️", "💂‍♀️", "💂‍♂️", "💂", "🥷", "👷‍♀️", "👷‍♂️", "👷", "👩‍⚕️", "👨‍⚕️", "🧑‍⚕️", "👩‍🎓", "🧑‍🎓", "👩‍🏫", "👨‍🏫", "👨‍🎓", "🧑‍🏫", "👩‍⚖️", "👨‍⚖️", "🧑‍⚖️", "👩‍🌾", "👨‍🌾", "🧑‍🌾", "👩‍🍳", "👩‍🔧", "🙍‍♀️", "🙍‍♀️", "🧏‍♀️", "🧏‍♂️", "🧏", "💁‍♀️", "💁‍♂️", "💁", "🙋‍♀️", "🙋‍♂️", "🙋‍♂️", "🧘", "🧘‍♂️", "🧘‍♀️", "🕺", "💃", "🤸‍♀️", "🤸‍♂️", "🤸"],
  intensity: {
    calm: { spawnInterval: 2500, maxActive: 2, minDuration: 4000, maxDuration: 6000 },
    cute: { spawnInterval: 1800, maxActive: 4, minDuration: 3800, maxDuration: 6200 },
    playful: { spawnInterval: 1200, maxActive: 6, minDuration: 3400, maxDuration: 5800 },
    celebration: { spawnInterval: 650, maxActive: 10, minDuration: 3000, maxDuration: 5200 }
  }
};

(() => {
  const style = document.createElement("style");
  style.textContent = `
    .emoji-bubble-wrap { width: max-content !important; max-width: calc(100vw - 20px) !important; }
    .floating-emoji { position: relative !important; z-index: 2 !important; display: block !important; width: max-content !important; line-height: 1 !important; white-space: nowrap !important; user-select: none !important; }
    .speech-bubble {
      position: absolute !important;
      top: 50% !important;
      z-index: 1 !important;
      box-sizing: border-box !important;
      width: max-content !important;
      min-width: 56px !important;
      max-width: min(205px, 52vw) !important;
      padding: 8px 11px !important;
      border: 1px solid rgba(139,111,97,.11) !important;
      border-radius: 16px !important;
      background: rgba(255,248,240,.97) !important;
      box-shadow: 0 10px 24px rgba(139,111,97,.14) !important;
      color: #5f4d45 !important;
      font: 700 .70rem/1.38 "Quicksand", sans-serif !important;
      text-align: left !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
      hyphens: auto !important;
      pointer-events: none !important;
      transform: translateY(-50%) !important;
      transform-origin: center !important;
    }
    .bubble-right { left: calc(100% + 9px) !important; right: auto !important; }
    .bubble-left { right: calc(100% + 9px) !important; left: auto !important; }
    .speech-bubble::after { content: "" !important; position: absolute !important; top: 50% !important; bottom: auto !important; width: 10px !important; height: 10px !important; background: inherit !important; border: 0 !important; }
    .bubble-right::after { left: -5px !important; right: auto !important; transform: translateY(-50%) rotate(45deg) !important; }
    .bubble-left::after { right: -5px !important; left: auto !important; transform: translateY(-50%) rotate(225deg) !important; }
    .secret-reveal { width: min(100%, 400px) !important; margin: 28px auto 0 !important; animation: secretPhotoIn .7s cubic-bezier(.2,.8,.2,1) both !important; }
    .secret-photo-card { width: min(100%, 380px) !important; margin: 0 auto !important; padding: 12px 12px 18px !important; background: #fffdf9 !important; box-shadow: var(--shadow) !important; transform: rotate(-1deg) !important; }
    .secret-photo-frame { width: 100% !important; aspect-ratio: 4 / 5 !important; overflow: hidden !important; border-radius: 8px !important; background: var(--light-beige) !important; display: grid !important; place-items: center !important; }
    .secret-photo-frame img { width: 100% !important; height: 100% !important; display: block !important; object-fit: contain !important; object-position: center !important; }
    .secret-caption { margin: 12px 5px 0 !important; font: 600 .82rem/1.5 "Quicksand", sans-serif !important; color: var(--ink) !important; }
    @keyframes secretPhotoIn { from { opacity: 0; transform: translateY(18px) rotate(-1deg) scale(.97); } to { opacity: 1; transform: translateY(0) rotate(-1deg) scale(1); } }
    @media (max-width: 520px) {
      .secret-reveal { width: min(100%, 360px) !important; margin-top: 24px !important; }
      .secret-photo-card { width: min(100%, 340px) !important; padding: 9px 9px 15px !important; }
    }
    @media (max-width: 380px) {
      .secret-reveal { width: 100% !important; }
      .secret-photo-card { width: min(100%, 300px) !important; }
    }
    @media (max-height: 700px) and (orientation: portrait) {
      .secret-photo-frame { aspect-ratio: 3 / 4 !important; }
    }
  `;
  document.head.appendChild(style);
})();
