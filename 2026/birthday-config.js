window.birthdayConfig = {
  name: "Yasmin Az Zahra'",
  birthday: "2006-09-10",
  mainPhoto: "image/main.jpeg",
  secretImage: "image/2.jpeg",
  secretCaption: "yaudah ini aja fotonya 😭",
  music: "Aku Milikmu - Dewa 19 (KARAOKE VERSION).mp3",
  letter: `happy birthday jaraaa 🎂

akhirnya kepala dua juga yaa. selamat datang di umur yang katanya udah dewasa, walaupun kayaknya masih suka bilang "bentar" terus hilang sejam wkwk.

semoga di umur yang baru ini jara selalu sehat, bahagia, dimudahkan semua urusannya, dan dipertemukan sama banyak hal baik. semoga semua yang lagi diusahain pelan pelan ketemu jalannya, dan semua yang lagi ditunggu semoga datang di waktu yang paling pas.

jangan terlalu keras sama diri sendiri yaa. kalau capek istirahat, kalau sedih gapapa, tapi nanti senyum lagi. ga harus selalu kuat setiap waktu. yang penting jangan lupa makan, jangan lupa minum, jangan kebanyakan begadang juga walaupun kemungkinan besar bakal dilanggar 😭

pokoknya selamat ulang tahun jaraaa. semoga tahun ini lebih baik dari sebelumnya, lebih banyak ketawa daripada nangis, lebih banyak cerita baik daripada hal yang bikin pusing.

udah ah segitu dulu. nanti jara geer.
stay lucu, stay gemess, dan jangan berubah jadi galak 🤍`,
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
    @media (max-width: 520px) { .speech-bubble { max-width: min(180px, 50vw) !important; padding: 8px 10px !important; font-size: .66rem !important; line-height: 1.34 !important; border-radius: 14px !important; } }
    @media (max-width: 380px) { .speech-bubble { max-width: 154px !important; min-width: 48px !important; padding: 7px 9px !important; font-size: .62rem !important; } }
  `;
  document.head.appendChild(style);
})();
