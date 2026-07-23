"use strict";
(() => {
  // dom.ts
  function buildApp() {
    document.body.style.overflow = "hidden";
    document.body.insertAdjacentHTML(
      "beforeend",
      `
    <div id="agus-root" class="agus-scope">
      <div class="page-wrapper">
        <section class="text-section">
          <div class="text-column">
            <article class="blurb">
              <h2>Subtitles</h2>
              <h3>Agus Wijaya</h3>
              <pre style="font-family: Helvetica, sans-serif">
A video plays on loop.
A system of subtitles
describes, anticipates
and misreads what is
happening. They produce
meaning rather than
clarify. It becomes
unclear what is being
described, or who
is speaking.
              </pre>
            </article>
            <nav class="settings-menu-inline" id="settings-inline" aria-label="Settings"></nav>
          </div>
        </section>
        <div class="play-section">
          <h2 class="play-button">Play</h2>
        </div>
      </div>
      <div class="video-container">
        <button class="close-button" aria-label="Close video">&times;</button>
        <div class="video-wrapper">
          <div id="vimeo-player"></div>
          <div class="video-click-target"></div>
        </div>
      </div>
      <button
        class="burger-button"
        id="burger-button"
        aria-label="Open settings"
        aria-expanded="false"
      >
        &#9776;
      </button>
      <nav
        class="settings-menu-floating"
        id="settings-floating"
        aria-label="Settings"
        hidden
      ></nav>
      <div class="settings-picker" id="settings-picker" hidden>
        <button class="picker-close" id="picker-close" aria-label="Close">
          &larr; Back
        </button>
        <div class="picker-track" id="picker-track" role="listbox">
          <div class="picker-track-inner" id="picker-track-inner"></div>
        </div>
      </div>
    </div>
    `
    );
    return document.getElementById("agus-root");
  }

  // video.ts
  var videoWrapper;
  var videoContainer;
  var playButton;
  var closeButton;
  var videoClickTarget;
  var player = null;
  var pendingPlayerEvents = [];
  function onPlayerEvent(event, fn) {
    if (player) player.on(event, fn);
    else pendingPlayerEvents.push([event, fn]);
  }
  function loadVimeoSdk() {
    if (typeof Vimeo !== "undefined") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Vimeo Player SDK"));
      document.head.append(script);
    });
  }
  var currentTime = 0;
  function pollTime() {
    if (!player) return;
    player.getCurrentTime().then((t) => currentTime = t);
    requestAnimationFrame(pollTime);
  }
  var isPaused = false;
  var loopCount = 1;
  var loopListeners = [];
  function restartLoop(nextLoopCount) {
    loopCount = nextLoopCount;
    if (player) player.setCurrentTime(0).then(() => player.play());
    loopListeners.forEach((fn) => fn());
  }
  var videoPlayer = {
    getCurrentTime: () => currentTime,
    getLoopCount: () => loopCount,
    onPause: (fn) => onPlayerEvent("pause", fn),
    onPlay: (fn) => onPlayerEvent("play", fn),
    onLoop: (fn) => loopListeners.push(fn)
  };
  var closeListeners = [];
  function onVideoClose(fn) {
    closeListeners.push(fn);
  }
  function setVideoOpen(open) {
    videoContainer.classList.toggle("show", open);
    document.body.classList.toggle("video-open", open);
    if (!open) closeListeners.forEach((fn) => fn());
  }
  async function initVideoPlayer(root) {
    videoWrapper = root.querySelector(".video-wrapper");
    videoContainer = root.querySelector(".video-container");
    playButton = root.querySelector(".play-button");
    closeButton = root.querySelector(".close-button");
    videoClickTarget = root.querySelector(".video-click-target");
    playButton.addEventListener("click", () => {
      restartLoop(1);
      setVideoOpen(true);
    });
    closeButton.addEventListener("click", () => {
      setVideoOpen(false);
    });
    videoContainer.addEventListener("click", (e) => {
      if (e.target === videoContainer) {
        setVideoOpen(false);
      }
    });
    videoClickTarget.addEventListener("click", () => {
      if (!player) return;
      if (isPaused) player.play();
      else player.pause();
    });
    await loadVimeoSdk();
    player = new Vimeo.Player("vimeo-player", {
      url: "https://vimeo.com/1209314643/8e3ff1a4bd",
      autoplay: true,
      muted: true,
      loop: true,
      playsinline: true,
      controls: false,
      title: false,
      byline: false,
      portrait: false,
      dnt: true
    });
    pendingPlayerEvents.forEach(([event, fn]) => player.on(event, fn));
    pendingPlayerEvents.length = 0;
    pollTime();
    player.on("pause", () => {
      isPaused = true;
    });
    player.on("play", () => {
      isPaused = false;
    });
    player.on("ended", () => {
      restartLoop(loopCount + 1);
    });
  }

  // captions-data.ts
  function parseTimestamps(timestamps) {
    const match = timestamps.match(
      /^(\d{2}):(\d{2}):(\d{2})\s*—\s*(\d{2}):(\d{2}):(\d{2})$/
    );
    if (!match) throw new Error(`Unrecognized timestamp format: "${timestamps}"`);
    const [, m1, s1, f1, m2, s2, f2] = match;
    const toMs = (m, s, f) => (Number(m) * 60 + Number(s) + Number(f) / 60) * 1e3;
    const timeStart = toMs(m1, s1, f1);
    const timeEnd = toMs(m2, s2, f2);
    return { timeStart, duration: timeEnd - timeStart };
  }
  function caption(id, timestamps, text) {
    return { id, timestamps, text, ...parseTimestamps(timestamps) };
  }
  var captions = [
    caption(1, "00:00:45 \u2014 00:03:24", {
      english: "This was not intended to be remembered",
      french: "Ceci n\u2019\xE9tait pas destin\xE9 \xE0 \xEAtre m\xE9moris\xE9",
      german: "Dies war nicht dazu bestimmt, erinnert zu werden",
      indonesian: "Ini tidak dimaksudkan untuk diingat"
    }),
    caption(2, "00:04:05 \u2014 00:05:38", {
      english: "They\u2019ve given this various names.",
      french: "On lui a donn\xE9 plusieurs noms.",
      german: "Man hat dem verschiedene Namen gegeben.",
      indonesian: "Ini telah diberi berbagai nama."
    }),
    caption(3, "00:07:02 \u2014 00:07:38", {
      english: "You are looking for clarity.",
      french: "Tu cherches la clart\xE9.",
      german: "Du suchst nach Klarheit.",
      indonesian: "Kamu sedang mencari kejelasan."
    }),
    caption(4, "00:07:39 \u2014 00:07:55", {
      english: "This may not be important.",
      french: "Ce n\u2019est peut-\xEAtre pas important.",
      german: "Das ist vielleicht nicht wichtig.",
      indonesian: "Ini mungkin tidak penting."
    }),
    caption(5, "00:07:56 \u2014 00:09:01", {
      english: "You are moving too fast.",
      french: "Tu vas trop vite.",
      german: "Du bewegst dich zu schnell.",
      indonesian: "Kamu bergerak terlalu cepat."
    }),
    caption(6, "00:09:53 \u2014 00:11:49", {
      english: "Stillness is often mistaken for depth.",
      french: "L\u2019immobilit\xE9 est souvent confondue avec la profondeur.",
      german: "Stille wird oft mit Tiefe verwechselt.",
      indonesian: "Diam sering disalahartikan sebagai kedalaman."
    }),
    caption(7, "00:15:07 \u2014 00:16:00", {
      english: "This has already occured.",
      french: "Ceci s\u2019est d\xE9j\xE0 produit.",
      german: "Dies ist bereits geschehen.",
      indonesian: "Ini sudah terjadi."
    }),
    caption(8, "00:19:00 \u2014 00:20:59", {
      english: "00:19-00.21 (time dilates)",
      french: "00:19-00.21 (le temps se dilate)",
      german: "00:19-00.21 (die Zeit dehnt sich)",
      indonesian: "00:19-00.21 (waktu melambat)"
    }),
    caption(9, "00:23:29 \u2014 00:25:03", {
      english: "[something changes off-screen]",
      french: "[quelque chose change hors champ]",
      german: "[etwas ver\xE4ndert sich au\xDFerhalb des Bildes]",
      indonesian: "[sesuatu berubah di luar layar]"
    }),
    caption(10, "00:26:14 \u2014 00:28:44", {
      english: '"Are you talking to yourself?"',
      french: "\xAB Tu te parles \xE0 toi-m\xEAme ? \xBB",
      german: "\u201ERedest du mit dir selbst?\u201C",
      indonesian: '"Apakah kamu bicara sendiri?"'
    }),
    caption(11, "00:31:00 \u2014 00:31:15", {
      english: "ths sctn hs bn rdc",
      french: "ctt sctn a \xE9t\xE9 rdg\xE9e",
      german: "dsr abschntt wrd geschwrzt",
      indonesian: "bgn ini tlh disnsor"
    }),
    caption(12, "00:34:15 \u2014 00:36:53", {
      english: "what were we?",
      french: "qu\u2019\xE9tions-nous ?",
      german: "was waren wir?",
      indonesian: "apa kita dulu?"
    }),
    caption(13, "00:40:00 \u2014 00:41:51", {
      english: "Some shot lingers too long.",
      french: "Un plan s\u2019attarde trop longtemps.",
      german: "Eine Einstellung verweilt zu lange.",
      indonesian: "Satu adegan bertahan terlalu lama."
    }),
    caption(14, "00:43:20 \u2014 00:45:59", {
      english: "You are waiting for something to happen.",
      french: "Tu attends que quelque chose se passe.",
      german: "Du wartest darauf, dass etwas geschieht.",
      indonesian: "Kamu menunggu sesuatu terjadi."
    }),
    caption(15, "00:50:57 \u2014 00:53:59", {
      english: "A portrait video rotated landscape.",
      french: "Une vid\xE9o portrait tourn\xE9e en paysage.",
      german: "Ein Hochformatvideo, ins Querformat gedreht.",
      indonesian: "Video potret yang diputar menjadi lanskap."
    }),
    caption(16, "00:55:53 \u2014 00:56:29", {
      english: "IMG_2392.MOV is playing.",
      french: "IMG_2392.MOV est en lecture.",
      german: "IMG_2392.MOV wird abgespielt.",
      indonesian: "IMG_2392.MOV sedang diputar."
    }),
    caption(17, "00:56:30 \u2014 00:58:19", {
      english: "IMG_4656.MOV is playing.",
      french: "IMG_4656.MOV est en lecture.",
      german: "IMG_4656.MOV wird abgespielt.",
      indonesian: "IMG_4656.MOV sedang diputar."
    }),
    caption(18, "01:07:43 \u2014 01:08:40", {
      english: "This was demolished in 2021.",
      french: "Ceci a \xE9t\xE9 d\xE9moli en 2021.",
      german: "Dies wurde 2021 abgerissen.",
      indonesian: "Ini dirobohkan pada tahun 2021."
    }),
    caption(19, "01:17:35 \u2014 01:18:59", {
      english: "Are you still willing?",
      french: "Es-tu toujours pr\xEAt(e) ?",
      german: "Bist du noch bereit?",
      indonesian: "Apakah kamu masih bersedia?"
    }),
    caption(20, "01:22:44 \u2014 01:24:19", {
      english: "This was about 5,500km from here.",
      french: "C\u2019\xE9tait \xE0 environ 5 500 km d\u2019ici.",
      german: "Das war etwa 5.500 km von hier entfernt.",
      indonesian: "Ini sekitar 5.500 km dari sini."
    }),
    caption(21, "01:24:20 \u2014 01:26:20", {
      english: "Prayer for all beings.",
      french: "Pri\xE8re pour tous les \xEAtres.",
      german: "Gebet f\xFCr alle Wesen.",
      indonesian: "Doa untuk semua makhluk."
    }),
    caption(22, "01:29:10 \u2014 01:30:34", {
      english: "[silence continues]",
      french: "[le silence continue]",
      german: "[die Stille h\xE4lt an]",
      indonesian: "[keheningan berlanjut]"
    }),
    caption(23, "01:37:47 \u2014 01:38:42", {
      english: "Year of the ocean...",
      french: "Ann\xE9e de l\u2019oc\xE9an...",
      german: "Jahr des Ozeans...",
      indonesian: "Tahun laut..."
    }),
    caption(24, "01:38:43 \u2014 01:40:27", {
      english: "I remember there was a hill behind.",
      french: "Je me souviens qu\u2019il y avait une colline derri\xE8re.",
      german: "Ich erinnere mich, dass dahinter ein H\xFCgel war.",
      indonesian: "Aku ingat dulu ada bukit di belakang."
    }),
    caption(25, "01:46:41 \u2014 01:48:27", {
      english: "[seen]",
      french: "[vu]",
      german: "[gesehen]",
      indonesian: "[terlihat]"
    })
  ];
  var captionsLoop2 = [
    caption(1, "00:00:45 \u2014 00:03:05", {
      english: "This has already occured.",
      french: "Ceci s\u2019est d\xE9j\xE0 produit.",
      german: "Dies ist bereits geschehen.",
      indonesian: "Ini sudah terjadi."
    }),
    caption(2, "00:03:46 \u2014 00:05:24", {
      english: "You remembered it anyway",
      french: "Tu t\u2019en es souvenu quand m\xEAme",
      german: "Du hast dich trotzdem daran erinnert",
      indonesian: "Kamu tetap mengingatnya"
    }),
    caption(3, "00:06:33 \u2014 00:07:44", {
      english: "You are still looking for clarity.",
      french: "Tu cherches encore la clart\xE9.",
      german: "Du suchst immer noch nach Klarheit.",
      indonesian: "Kamu masih mencari kejelasan."
    }),
    caption(4, "00:07:48 \u2014 00:08:50", {
      english: "This may not be important.",
      french: "Ce n\u2019est peut-\xEAtre pas important.",
      german: "Das ist vielleicht nicht wichtig.",
      indonesian: "Ini mungkin tidak penting."
    }),
    caption(5, "00:09:53 \u2014 00:11:49", {
      english: "Stillness is often mistaken for depth.",
      french: "L\u2019immobilit\xE9 est souvent confondue avec la profondeur.",
      german: "Stille wird oft mit Tiefe verwechselt.",
      indonesian: "Diam sering disalahartikan sebagai kedalaman."
    }),
    caption(6, "00:15:07 \u2014 00:16:00", {
      english: "xx px/s",
      french: "xx px/s",
      german: "xx px/s",
      indonesian: "xx px/s"
    }),
    caption(7, "00:19:00 \u2014 00:20:59", {
      english: "(time dilates)",
      french: "(le temps se dilate)",
      german: "(die Zeit dehnt sich)",
      indonesian: "(waktu melambat)"
    }),
    caption(8, "00:23:29 \u2014 00:25:03", {
      english: "[something changes off-screen]",
      french: "[quelque chose change hors champ]",
      german: "[etwas ver\xE4ndert sich au\xDFerhalb des Bildes]",
      indonesian: "[sesuatu berubah di luar layar]"
    }),
    caption(9, "00:26:14 \u2014 00:28:44", {
      english: '"Are you talking to yourself?"',
      french: "\xAB Tu te parles \xE0 toi-m\xEAme ? \xBB",
      german: "\u201ERedest du mit dir selbst?\u201C",
      indonesian: '"Apakah kamu bicara sendiri?"'
    }),
    caption(10, "00:31:00 \u2014 00:31:15", {
      english: "ths sctn hs bn rdc",
      french: "ctt sctn a \xE9t\xE9 rdg\xE9e",
      german: "dsr abschntt wrd geschwrzt",
      indonesian: "bgn ini tlh disnsor"
    }),
    caption(13, "00:34:15 \u2014 00:36:53", {
      english: "what were we?",
      french: "qu\u2019\xE9tions-nous ?",
      german: "was waren wir?",
      indonesian: "apa kita dulu?"
    }),
    caption(14, "00:40:00 \u2014 00:41:51", {
      english: "Some shot lingers too long.",
      french: "Un plan s\u2019attarde trop longtemps.",
      german: "Eine Einstellung verweilt zu lange.",
      indonesian: "Satu adegan bertahan terlalu lama."
    }),
    caption(15, "00:43:20 \u2014 00:45:19", {
      english: "Something may have already happened.",
      french: "Quelque chose s\u2019est peut-\xEAtre d\xE9j\xE0 produit.",
      german: "Etwas ist vielleicht schon geschehen.",
      indonesian: "Sesuatu mungkin sudah terjadi."
    }),
    caption(16, "00:50:57 \u2014 00:53:45", {
      english: ">> time stamp",
      french: ">> horodatage",
      german: ">> Zeitstempel",
      indonesian: ">> stempel waktu"
    }),
    caption(17, "00:55:53 \u2014 00:56:29", {
      english: "IMG_2392.MOV is playing.",
      french: "IMG_2392.MOV est en lecture.",
      german: "IMG_2392.MOV wird abgespielt.",
      indonesian: "IMG_2392.MOV sedang diputar."
    }),
    caption(18, "00:56:30 \u2014 00:58:19", {
      english: "IMG_4656.MOV is playing.",
      french: "IMG_4656.MOV est en lecture.",
      german: "IMG_4656.MOV wird abgespielt.",
      indonesian: "IMG_4656.MOV sedang diputar."
    }),
    caption(19, "01:07:43 \u2014 01:08:40", {
      english: "This was demolished in 2021.",
      french: "Ceci a \xE9t\xE9 d\xE9moli en 2021.",
      german: "Dies wurde 2021 abgerissen.",
      indonesian: "Ini dirobohkan pada tahun 2021."
    }),
    caption(20, "01:17:35 \u2014 01:18:59", {
      english: "Are you still willing?",
      french: "Es-tu toujours pr\xEAt(e) ?",
      german: "Bist du noch bereit?",
      indonesian: "Apakah kamu masih bersedia?"
    }),
    caption(21, "01:21:15 \u2014 01:22:43", {
      english: "How\u2019s this relevant here?",
      french: "En quoi est-ce pertinent ici ?",
      german: "Was hat das hiermit zu tun?",
      indonesian: "Apa relevansinya di sini?"
    }),
    caption(22, "01:24:20 \u2014 01:26:20", {
      english: "Prayer for all beings.",
      french: "Pri\xE8re pour tous les \xEAtres.",
      german: "Gebet f\xFCr alle Wesen.",
      indonesian: "Doa untuk semua makhluk."
    }),
    caption(23, "01:29:10 \u2014 01:30:34", {
      english: "[silence continues]",
      french: "[le silence continue]",
      german: "[die Stille h\xE4lt an]",
      indonesian: "[keheningan berlanjut]"
    }),
    caption(24, "01:37:47 \u2014 01:38:42", {
      english: "Year of the ocean...",
      french: "Ann\xE9e de l\u2019oc\xE9an...",
      german: "Jahr des Ozeans...",
      indonesian: "Tahun laut..."
    }),
    caption(25, "01:38:43 \u2014 01:40:27", {
      english: ">> activity",
      french: ">> activit\xE9",
      german: ">> Aktivit\xE4t",
      indonesian: ">> aktivitas"
    }),
    caption(26, "01:45:38 \u2014 01:48:27", {
      english: "You have already seen this.",
      french: "Tu as d\xE9j\xE0 vu ceci.",
      german: "Du hast das schon gesehen.",
      indonesian: "Kamu sudah melihat ini sebelumnya."
    })
  ];
  var customCaptions = [
    {
      id: 5,
      text: {
        english: "You're moving too fast",
        french: "Tu vas trop vite",
        german: "Du bewegst dich zu schnell",
        indonesian: "Kamu bergerak terlalu cepat"
      },
      condition: (state) => state.speed > 6,
      duration: 1e3
    },
    {
      id: 6,
      text: {
        english: "Wait, don't leave",
        french: "Attends, ne pars pas",
        german: "Warte, geh nicht",
        indonesian: "Tunggu, jangan pergi"
      },
      condition: (state) => state.position.y < 100 && state.directionY === "up",
      duration: 1e3
    }
  ];

  // captions-types.ts
  var languages = ["english", "french", "german", "indonesian"];

  // settings.ts
  var defaultSettings = {
    fontFamily: "Helvetica",
    fontColour: "white",
    boxColour: "black",
    language: "english",
    audioDescription: "off"
  };
  var options = {
    fontFamily: ["Helvetica", "Georgia", "Courier New", "Times New Roman"],
    fontColour: ["white", "black", "red", "cyan", "yellow"],
    boxColour: ["black", "white", "transparent", "red"],
    language: languages,
    audioDescription: ["off", "on"]
  };
  var languageLabels = {
    english: "English",
    french: "Fran\xE7ais",
    german: "Deutsch",
    indonesian: "Bahasa Indonesia"
  };
  var languageCodes = {
    english: "en",
    french: "fr",
    german: "de",
    indonesian: "id"
  };
  var audioDescriptionLabels = {
    off: "Off",
    on: "On"
  };
  function labelFor(key, value) {
    if (key === "language") return languageLabels[value];
    if (key === "audioDescription")
      return audioDescriptionLabels[value];
    return String(value);
  }
  var settings = { ...defaultSettings };
  var listeners = [];
  function getSettings() {
    return settings;
  }
  function onSettingsChange(fn) {
    listeners.push(fn);
  }
  function setSetting(key, value) {
    if (settings[key] === value) return;
    settings = { ...settings, [key]: value };
    applySettings();
  }
  function resetKeys(keys) {
    settings = { ...settings };
    keys.forEach((key) => {
      settings[key] = defaultSettings[key];
    });
    applySettings();
  }
  function quoteIfNeeded(fontFamily) {
    return fontFamily.includes(" ") ? `"${fontFamily}"` : fontFamily;
  }
  function applySettings() {
    const scopeRoot = document.getElementById("agus-root") ?? document.documentElement;
    scopeRoot.style.setProperty(
      "--caption-font-family",
      `${quoteIfNeeded(settings.fontFamily)}, sans-serif`
    );
    scopeRoot.style.setProperty("--caption-colour", settings.fontColour);
    scopeRoot.style.setProperty("--caption-box-colour", settings.boxColour);
    document.documentElement.setAttribute("lang", languageCodes[settings.language]);
    document.documentElement.setAttribute(
      "data-audio-description",
      settings.audioDescription
    );
    listeners.forEach((fn) => fn(settings));
  }
  applySettings();

  // pointer-tracker.ts
  var initialState = {
    directionX: "none",
    directionY: "none",
    position: { x: 0, y: 0 },
    speed: 0
  };
  function createPointerTracker() {
    let state = initialState;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    window.addEventListener("mousemove", (e) => {
      const time = e.timeStamp;
      const currentX = e.x;
      const currentY = e.y;
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const dt = time - lastTime;
      const hyp = Math.sqrt(dx * dx + dy * dy);
      const speed = hyp / dt;
      lastX = currentX;
      lastY = currentY;
      lastTime = time;
      state = {
        directionX: dx > 0 ? "right" : dx < 0 ? "left" : "none",
        directionY: dy > 0 ? "down" : dy < 0 ? "up" : "none",
        position: { x: lastX, y: lastY },
        speed
      };
    });
    return { getState: () => state };
  }

  // captions-player.ts
  var currentId = null;
  var currentCaption = null;
  var currentElement = null;
  var currentTimeout = null;
  var isPaused2 = false;
  var pointerTracker = createPointerTracker();
  function getActiveCaptions() {
    return videoPlayer.getLoopCount() % 2 === 1 ? captions : captionsLoop2;
  }
  function playCaption() {
    if (isPaused2) return;
    const time = videoPlayer.getCurrentTime() * 1e3;
    const custom = customCaptions.find((c) => c.condition(pointerTracker.getState()));
    if (custom && currentId !== custom.id) createCaption(custom);
    else if (!currentId) {
      const currentMatch = getActiveCaptions().find(
        (c) => c.timeStart < time && c.timeStart + c.duration > time
      );
      if (currentMatch) {
        createCaption(currentMatch);
      }
    }
    requestAnimationFrame(playCaption);
  }
  function createCaption(caption2) {
    const { id, text, duration } = caption2;
    if (currentTimeout) clearTimeout(currentTimeout);
    if (currentElement) currentElement.remove();
    currentId = id;
    currentCaption = caption2;
    const rectangle = document.createElement("div");
    rectangle.classList.add("caption-container");
    rectangle.textContent = text[getSettings().language];
    videoWrapper.append(rectangle);
    currentElement = rectangle;
    currentTimeout = setTimeout(() => {
      rectangle.remove();
      currentId = null;
      currentCaption = null;
      currentElement = null;
      currentTimeout = null;
    }, duration);
  }
  function initCaptionsPlayer() {
    playCaption();
    onSettingsChange((s) => {
      if (currentElement && currentCaption) {
        currentElement.textContent = currentCaption.text[s.language];
      }
    });
    videoPlayer.onPause(() => {
      isPaused2 = true;
    });
    videoPlayer.onPlay(() => {
      isPaused2 = false;
      playCaption();
    });
    videoPlayer.onLoop(() => {
      if (currentTimeout) clearTimeout(currentTimeout);
      if (currentElement) currentElement.remove();
      currentId = null;
      currentCaption = null;
      currentElement = null;
      currentTimeout = null;
    });
  }

  // draggable-track.ts
  function makeDraggableTrack(viewport, track, onChange) {
    let offset = 0;
    let dragging = false;
    let engaged = false;
    let startClientX = 0;
    let startOffset = 0;
    const DRAG_THRESHOLD = 5;
    viewport.style.touchAction = "pan-y";
    viewport.style.cursor = "grab";
    function clampOffset(px) {
      const slack = viewport.clientWidth - track.offsetWidth;
      const min = Math.min(0, slack);
      const max = Math.max(0, slack);
      return Math.max(min, Math.min(max, px));
    }
    function setOffset(px) {
      offset = clampOffset(px);
      track.style.transform = `translateX(${offset}px)`;
      onChange?.();
    }
    function resetOffset() {
      offset = 0;
      track.style.transform = "";
    }
    function centerOn(item) {
      const viewportRect = viewport.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;
      const itemCenter = itemRect.left + itemRect.width / 2;
      setOffset(offset + (viewportCenter - itemCenter));
    }
    viewport.addEventListener("pointerdown", (e) => {
      dragging = true;
      engaged = false;
      startClientX = e.clientX;
      startOffset = offset;
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const delta = e.clientX - startClientX;
      if (!engaged) {
        if (Math.abs(delta) < DRAG_THRESHOLD) return;
        engaged = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.style.cursor = "grabbing";
      }
      setOffset(startOffset + delta);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      viewport.style.cursor = "grab";
      if (engaged) {
        engaged = false;
        viewport.releasePointerCapture(e.pointerId);
        const swallow = (ce) => {
          ce.stopPropagation();
          ce.preventDefault();
        };
        viewport.addEventListener("click", swallow, {
          capture: true,
          once: true
        });
      }
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", (e) => {
      if (dragging && !engaged) dragging = false;
      else if (dragging) endDrag(e);
    });
    viewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        setOffset(offset - delta);
      },
      { passive: false }
    );
    return { setOffset, getOffset: () => offset, centerOn, resetOffset };
  }

  // settings-picker.ts
  var picker;
  var pickerTrack;
  var pickerTrackInner;
  var pickerClose;
  var pickerDrag;
  var activePickerKey = null;
  var pickerReturnFocus = null;
  function isInsidePicker(path) {
    return path.includes(picker);
  }
  function isPickerOpen() {
    return !picker.hidden;
  }
  function closePicker() {
    if (picker.hidden) return;
    picker.hidden = true;
    pickerTrackInner.replaceChildren();
    pickerDrag.resetOffset();
    activePickerKey = null;
    const returnFocus = pickerReturnFocus;
    pickerReturnFocus = null;
    returnFocus?.();
  }
  function applyPreviewStyle(item, key, value) {
    switch (key) {
      case "fontFamily":
        item.style.fontFamily = `${value}, sans-serif`;
        break;
      case "fontColour":
        item.style.color = value;
        item.style.textShadow = "0 0 3px black, 0 0 3px black";
        break;
      case "boxColour":
        item.style.background = value;
        item.style.color = value === "white" ? "black" : "white";
        item.style.padding = "6px 12px";
        item.style.borderRadius = "4px";
        break;
    }
  }
  function focusSibling(item, dir) {
    const items = Array.from(
      pickerTrackInner.querySelectorAll(".picker-item")
    );
    const idx = items.indexOf(item);
    const next = items[idx + dir];
    if (next) {
      next.focus();
      pickerDrag.centerOn(next);
      if (activePickerKey) {
        setSetting(
          activePickerKey,
          next.dataset.value
        );
      }
    }
  }
  function openPicker(key, onClose) {
    activePickerKey = key;
    pickerReturnFocus = onClose;
    picker.hidden = false;
    pickerTrackInner.replaceChildren();
    options[key].forEach((value) => {
      const item = document.createElement("div");
      item.className = "picker-item";
      item.textContent = labelFor(key, value);
      item.dataset.value = String(value);
      item.tabIndex = 0;
      item.setAttribute("role", "option");
      applyPreviewStyle(item, key, value);
      item.addEventListener("click", () => {
        setSetting(key, value);
        closePicker();
      });
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSetting(key, value);
          closePicker();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          focusSibling(item, 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          focusSibling(item, -1);
        } else if (e.key === "Escape") {
          e.preventDefault();
          closePicker();
        }
      });
      pickerTrackInner.append(item);
    });
    requestAnimationFrame(() => {
      const currentItem = pickerTrackInner.querySelector(
        `[data-value="${CSS.escape(String(getSettings()[key]))}"]`
      );
      if (currentItem) {
        pickerDrag.centerOn(currentItem);
        currentItem.focus();
      }
      updateActiveItem();
    });
  }
  function updateActiveItem() {
    const viewportRect = pickerTrack.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    const items = pickerTrackInner.querySelectorAll(".picker-item");
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const dist = Math.abs(itemCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });
    items.forEach((item) => {
      const active = item === closest;
      item.style.zIndex = "1000";
      item.style.opacity = active ? "1" : "0.5";
      item.style.fontWeight = active ? "700" : "400";
      item.style.transform = active ? "scale(1.15)" : "scale(1)";
    });
    return closest;
  }
  function initSettingsPicker(root) {
    picker = root.querySelector("#settings-picker");
    pickerTrack = root.querySelector("#picker-track");
    pickerTrackInner = root.querySelector("#picker-track-inner");
    pickerClose = root.querySelector("#picker-close");
    pickerDrag = makeDraggableTrack(pickerTrack, pickerTrackInner, () => {
      const active = updateActiveItem();
      if (active && activePickerKey) {
        setSetting(
          activePickerKey,
          active.dataset.value
        );
      }
    });
    pickerClose.addEventListener("click", () => closePicker());
    picker.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
    });
  }

  // arrow-nav.ts
  function enableArrowNav(list, orientation, onEscape, onMove) {
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    list.addEventListener("keydown", (e) => {
      const buttons = Array.from(
        list.querySelectorAll(":scope > button")
      );
      const idx = buttons.indexOf(document.activeElement);
      if (e.key === prevKey && idx > -1) {
        e.preventDefault();
        const next = buttons[(idx - 1 + buttons.length) % buttons.length];
        next.focus();
        onMove ? onMove(next) : next.scrollIntoView({ inline: "nearest", block: "nearest" });
      } else if (e.key === nextKey && idx > -1) {
        e.preventDefault();
        const next = buttons[(idx + 1) % buttons.length];
        next.focus();
        onMove ? onMove(next) : next.scrollIntoView({ inline: "nearest", block: "nearest" });
      } else if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    });
  }

  // settings-menu.ts
  var branchLabel = {
    font: "Font",
    options: "Options"
  };
  var branchLeaves = {
    font: [
      { key: "fontFamily", label: "Family" },
      { key: "fontColour", label: "Colour" },
      { key: "boxColour", label: "Textbox" }
    ],
    options: [
      { key: "language", label: "Language" },
      { key: "audioDescription", label: "Audio Description" }
    ]
  };
  function makeCapsule(label, ariaLabel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "capsule";
    btn.textContent = label;
    if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
    return btn;
  }
  function createSettingsMenu(container, opts = {}) {
    let openBranch = null;
    function render() {
      container.replaceChildren();
      const list = document.createElement("div");
      list.className = "capsule-list capsule-list--vertical";
      list.setAttribute("role", "menu");
      list.setAttribute("aria-orientation", "vertical");
      ["font", "options"].forEach((branch) => {
        if (openBranch === branch) {
          list.append(renderExpandedRow(branch));
        } else {
          const btn = makeCapsule(branchLabel[branch]);
          btn.dataset.branch = branch;
          btn.addEventListener("click", () => {
            if (openBranch !== null) closePicker();
            openBranch = branch;
            render();
            requestAnimationFrame(() => {
              container.querySelector(".capsule-list--horizontal .capsule")?.focus();
            });
          });
          list.append(btn);
        }
      });
      container.append(list);
      enableArrowNav(list, "vertical", () => opts.onRootEscape?.());
    }
    function renderExpandedRow(branch) {
      const row = document.createElement("div");
      row.className = "capsule-list capsule-list--horizontal";
      row.setAttribute("role", "menu");
      row.setAttribute("aria-orientation", "horizontal");
      const track = document.createElement("div");
      track.className = "capsule-row-track";
      row.append(track);
      const drag = makeDraggableTrack(row, track);
      branchLeaves[branch].forEach((leaf) => {
        const btn = makeCapsule(leaf.label);
        btn.dataset.leaf = leaf.key;
        btn.addEventListener("click", () => {
          openPicker(leaf.key, () => {
            requestAnimationFrame(() => {
              container.querySelector(`[data-leaf="${leaf.key}"]`)?.focus();
            });
          });
        });
        track.append(btn);
      });
      const resetBtn = makeCapsule("Reset");
      resetBtn.addEventListener("click", () => collapse(branch, true));
      track.append(resetBtn);
      const closeBtn = makeCapsule("\u2715", "Close");
      closeBtn.classList.add("capsule--close");
      closeBtn.addEventListener("click", () => collapse(branch, false));
      track.append(closeBtn);
      enableArrowNav(
        track,
        "horizontal",
        () => collapse(branch, false),
        (item) => drag.centerOn(item)
      );
      return row;
    }
    function collapse(branch, reset) {
      closePicker();
      if (reset) resetKeys(branchLeaves[branch].map((l) => l.key));
      openBranch = null;
      render();
      requestAnimationFrame(() => {
        container.querySelector(`[data-branch="${branch}"]`)?.focus();
      });
    }
    function collapseToRoot() {
      if (openBranch === null && !isPickerOpen()) return;
      closePicker();
      openBranch = null;
      render();
    }
    render();
    if (opts.focusOnBuild) {
      container.querySelector(".capsule")?.focus();
    }
    return { collapseToRoot };
  }
  function initSettingsMenus(root) {
    const inlineSettings = root.querySelector("#settings-inline");
    const inlineMenu = createSettingsMenu(inlineSettings);
    const burgerButton = root.querySelector("#burger-button");
    const floatingMenu = root.querySelector("#settings-floating");
    function closeFloatingMenu() {
      floatingMenu.hidden = true;
      burgerButton.setAttribute("aria-expanded", "false");
      closePicker();
    }
    onVideoClose(closeFloatingMenu);
    burgerButton.addEventListener("click", () => {
      const willOpen = floatingMenu.hidden;
      if (willOpen) {
        floatingMenu.hidden = false;
        burgerButton.setAttribute("aria-expanded", "true");
        createSettingsMenu(floatingMenu, {
          focusOnBuild: true,
          onRootEscape: () => {
            closeFloatingMenu();
            burgerButton.focus();
          }
        });
      } else {
        closeFloatingMenu();
      }
    });
    document.addEventListener("click", (e) => {
      const path = e.composedPath();
      const insidePicker = isInsidePicker(path);
      if (!path.includes(inlineSettings) && !path.includes(floatingMenu) && !insidePicker) {
        inlineMenu.collapseToRoot();
      }
      if (!floatingMenu.hidden && !path.includes(floatingMenu) && !path.includes(burgerButton) && !insidePicker) {
        closeFloatingMenu();
      }
    });
  }

  // script.ts
  var MOUNT_ID = "agus-app";
  function init() {
    const anchor = document.getElementById(MOUNT_ID);
    if (!anchor) {
      throw new Error(`Missing mount point: <div id="${MOUNT_ID}"></div>`);
    }
    anchor.style.display = "none";
    const root = buildApp();
    initVideoPlayer(root);
    initCaptionsPlayer();
    initSettingsPicker(root);
    initSettingsMenus(root);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
