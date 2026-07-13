"use strict";
(() => {
  // video.ts
  var videoWrapper = document.querySelector(".video-wrapper");
  var videoContainer = document.querySelector(".video-container");
  var playButton = document.querySelector(".play-button");
  var closeButton = document.querySelector(".close-button");
  var videoClickTarget = document.querySelector(".video-click-target");
  var player = new Vimeo.Player("vimeo-player", {
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
  var currentTime = 0;
  function pollTime() {
    player.getCurrentTime().then((t) => currentTime = t);
    requestAnimationFrame(pollTime);
  }
  pollTime();
  var isPaused = false;
  player.on("pause", () => {
    isPaused = true;
  });
  player.on("play", () => {
    isPaused = false;
  });
  var videoPlayer = {
    getCurrentTime: () => currentTime,
    onPause: (fn) => player.on("pause", fn),
    onPlay: (fn) => player.on("play", fn)
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
  function initVideoPlayer() {
    playButton.addEventListener("click", () => {
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
      if (isPaused) player.play();
      else player.pause();
    });
  }

  // captions-data.ts
  var captions = [
    {
      id: 1,
      timestamps: "00:00:45 \u2014 00:03:24",
      text: {
        english: "This was not intended to be remembered",
        french: "Ceci n\u2019\xE9tait pas destin\xE9 \xE0 \xEAtre m\xE9moris\xE9",
        german: "Dies war nicht dazu bestimmt, erinnert zu werden",
        indonesian: "Ini tidak dimaksudkan untuk diingat"
      },
      timeStart: 45 / 60 * 100,
      duration: 1200
    },
    {
      id: 2,
      timestamps: "00:04:05 \u2014 00:05:38",
      text: {
        english: "They\u2019ve given this various names.",
        french: "On lui a donn\xE9 plusieurs noms.",
        german: "Man hat dem verschiedene Namen gegeben.",
        indonesian: "Ini telah diberi berbagai nama."
      },
      timeStart: 4 * 1e3 + 5 / 60 * 100,
      duration: 600
    },
    {
      id: 3,
      timestamps: "00:07:02 \u2014 00:07:38",
      text: {
        english: "You are looking for clarity.",
        french: "Tu cherches la clart\xE9.",
        german: "Du suchst nach Klarheit.",
        indonesian: "Kamu sedang mencari kejelasan."
      },
      timeStart: 7 * 1e3 + 2 / 60 * 100,
      duration: 400
    },
    {
      id: 4,
      timestamps: "00:07:39 \u2014 00:07:55",
      text: {
        english: "This may not be important.",
        french: "Ce n\u2019est peut-\xEAtre pas important.",
        german: "Das ist vielleicht nicht wichtig.",
        indonesian: "Ini mungkin tidak penting."
      },
      timeStart: 7 * 1e3 + 39 / 60 * 100,
      duration: 1200
    },
    {
      id: 5,
      timestamps: "00:07:56 \u2014 00:09:01",
      text: {
        english: "You are moving too fast.",
        french: "Tu vas trop vite.",
        german: "Du bewegst dich zu schnell.",
        indonesian: "Kamu bergerak terlalu cepat."
      },
      timeStart: 7 * 1e3 + 56 / 60 * 100,
      duration: 1200
    },
    {
      id: 6,
      timestamps: "00:09:53 \u2014 00:11:49",
      text: {
        english: "Stillness is often mistaken for depth.",
        french: "L\u2019immobilit\xE9 est souvent confondue avec la profondeur.",
        german: "Stille wird oft mit Tiefe verwechselt.",
        indonesian: "Diam sering disalahartikan sebagai kedalaman."
      },
      timeStart: 9 * 1e3 + 53 / 60 * 100,
      duration: 1200
    },
    {
      id: 7,
      timestamps: "00:15:07 \u2014 00:16:00",
      text: {
        english: "This has already occured.",
        french: "Ceci s\u2019est d\xE9j\xE0 produit.",
        german: "Dies ist bereits geschehen.",
        indonesian: "Ini sudah terjadi."
      },
      timeStart: 15 * 1e3 + 7 / 60 * 100,
      duration: 1200
    },
    {
      id: 8,
      timestamps: "00:19:00 \u2014 00:20:59",
      text: {
        english: "00:19-00.21 (time dilates)",
        french: "00:19-00.21 (le temps se dilate)",
        german: "00:19-00.21 (die Zeit dehnt sich)",
        indonesian: "00:19-00.21 (waktu melambat)"
      },
      timeStart: 19 * 1e3,
      duration: 1200
    },
    {
      id: 9,
      timestamps: "00:23:29 \u2014 00:25:03",
      text: {
        english: "[something changes off-screen]",
        french: "[quelque chose change hors champ]",
        german: "[etwas ver\xE4ndert sich au\xDFerhalb des Bildes]",
        indonesian: "[sesuatu berubah di luar layar]"
      },
      timeStart: 23 * 1e3 + 29 / 60 * 100,
      duration: 1200
    },
    {
      id: 10,
      timestamps: "00:26:14 \u2014 00:28:44",
      text: {
        english: '"Are you talking to yourself?"',
        french: "\xAB Tu te parles \xE0 toi-m\xEAme ? \xBB",
        german: "\u201ERedest du mit dir selbst?\u201C",
        indonesian: '"Apakah kamu bicara sendiri?"'
      },
      timeStart: 26 * 1e3 + 14 / 60 * 100,
      duration: 1200
    },
    {
      id: 11,
      timestamps: "00:31:00 \u2014 00:31:15",
      text: {
        english: "ths sctn hs bn rdc",
        french: "ctt sctn a \xE9t\xE9 rdg\xE9e",
        german: "dsr abschntt wrd geschwrzt",
        indonesian: "bgn ini tlh disnsor"
      },
      timeStart: 31 * 1e3,
      duration: 1200
    },
    {
      id: 12,
      timestamps: "00:34:15 \u2014 00:36:53",
      text: {
        english: "what were we?",
        french: "qu\u2019\xE9tions-nous ?",
        german: "was waren wir?",
        indonesian: "apa kita dulu?"
      },
      timeStart: 34 * 1e3 + 15 / 60 * 100,
      duration: 1200
    },
    {
      id: 13,
      timestamps: "00:40:00 \u2014 00:41:51",
      text: {
        english: "Some shot lingers too long.",
        french: "Un plan s\u2019attarde trop longtemps.",
        german: "Eine Einstellung verweilt zu lange.",
        indonesian: "Satu adegan bertahan terlalu lama."
      },
      timeStart: 40 * 1e3,
      duration: 1200
    },
    {
      id: 14,
      timestamps: "00:43:20 \u2014 00:45:59",
      text: {
        english: "You are waiting for something to happen.",
        french: "Tu attends que quelque chose se passe.",
        german: "Du wartest darauf, dass etwas geschieht.",
        indonesian: "Kamu menunggu sesuatu terjadi."
      },
      timeStart: 43 * 1e3 + 20 / 60 * 100,
      duration: 1200
    },
    {
      id: 15,
      timestamps: "00:50:57 \u2014 00:53:59",
      text: {
        english: "A portrait video rotated landscape.",
        french: "Une vid\xE9o portrait tourn\xE9e en paysage.",
        german: "Ein Hochformatvideo, ins Querformat gedreht.",
        indonesian: "Video potret yang diputar menjadi lanskap."
      },
      timeStart: 50 * 1e3 + 57 / 60 * 100,
      duration: 1200
    },
    {
      id: 16,
      timestamps: "00:55:53 \u2014 00:56:29",
      text: {
        english: "IMG_2392.MOV is playing.",
        french: "IMG_2392.MOV est en lecture.",
        german: "IMG_2392.MOV wird abgespielt.",
        indonesian: "IMG_2392.MOV sedang diputar."
      },
      timeStart: 55 * 1e3 + 53 / 60 * 100,
      duration: 1200
    },
    {
      id: 17,
      timestamps: "00:56:30 \u2014 00:58:19",
      text: {
        english: "IMG_4656.MOV is playing.",
        french: "IMG_4656.MOV est en lecture.",
        german: "IMG_4656.MOV wird abgespielt.",
        indonesian: "IMG_4656.MOV sedang diputar."
      },
      timeStart: 56 * 1e3 + 30 / 60 * 100,
      duration: 1200
    },
    {
      id: 18,
      timestamps: "01:07:43 \u2014 01:08:40",
      text: {
        english: "This was demolished in 2021.",
        french: "Ceci a \xE9t\xE9 d\xE9moli en 2021.",
        german: "Dies wurde 2021 abgerissen.",
        indonesian: "Ini dirobohkan pada tahun 2021."
      },
      timeStart: 1 * 60 * 1e3 + 7 * 1e3 + 43 / 60 * 100,
      duration: 1200
    },
    {
      id: 19,
      timestamps: "01:17:35 \u2014 01:18:59",
      text: {
        english: "Are you still willing?",
        french: "Es-tu toujours pr\xEAt(e) ?",
        german: "Bist du noch bereit?",
        indonesian: "Apakah kamu masih bersedia?"
      },
      timeStart: 1 * 60 * 1e3 + 17 * 1e3 + 35 / 60 * 100,
      duration: 1200
    },
    {
      id: 20,
      timestamps: "01:22:44 \u2014 01:24:19",
      text: {
        english: "This was about 5,500km from here.",
        french: "C\u2019\xE9tait \xE0 environ 5 500 km d\u2019ici.",
        german: "Das war etwa 5.500 km von hier entfernt.",
        indonesian: "Ini sekitar 5.500 km dari sini."
      },
      timeStart: 1 * 60 * 1e3 + 22 * 1e3 + 44 / 60 * 100,
      duration: 1200
    },
    {
      id: 21,
      timestamps: "01:24:20 \u2014 01:26:20",
      text: {
        english: "Prayer for all beings.",
        french: "Pri\xE8re pour tous les \xEAtres.",
        german: "Gebet f\xFCr alle Wesen.",
        indonesian: "Doa untuk semua makhluk."
      },
      timeStart: 1 * 60 * 1e3 + 24 * 1e3 + 20 / 60 * 100,
      duration: 1200
    },
    {
      id: 22,
      timestamps: "01:29:10 \u2014 01:30:34",
      text: {
        english: "[silence continues]",
        french: "[le silence continue]",
        german: "[die Stille h\xE4lt an]",
        indonesian: "[keheningan berlanjut]"
      },
      timeStart: 1 * 60 * 1e3 + 29 * 1e3 + 10 / 60 * 100,
      duration: 1200
    },
    {
      id: 23,
      timestamps: "01:37:47 \u2014 01:38:42",
      text: {
        english: "Year of the ocean...",
        french: "Ann\xE9e de l\u2019oc\xE9an...",
        german: "Jahr des Ozeans...",
        indonesian: "Tahun laut..."
      },
      timeStart: 1 * 60 * 1e3 + 37 * 1e3 + 47 / 60 * 100,
      duration: 1200
    },
    {
      id: 24,
      timestamps: "01:38:43 \u2014 01:40:27",
      text: {
        english: "I remember there was a hill behind.",
        french: "Je me souviens qu\u2019il y avait une colline derri\xE8re.",
        german: "Ich erinnere mich, dass dahinter ein H\xFCgel war.",
        indonesian: "Aku ingat dulu ada bukit di belakang."
      },
      timeStart: 1 * 60 * 1e3 + 38 * 1e3 + 43 / 60 * 100,
      duration: 1200
    },
    {
      id: 25,
      timestamps: "01:46:41 \u2014 01:48:27",
      text: {
        english: "[seen]",
        french: "[vu]",
        german: "[gesehen]",
        indonesian: "[terlihat]"
      },
      timeStart: 1 * 60 * 1e3 + 46 * 1e3 + 41 / 60 * 100,
      duration: 1200
    }
  ];
  var captionsLoop2 = [
    {
      id: 1,
      timestamps: "00:00:45 \u2014 00:03:05",
      text: {
        english: "This has already occured.",
        french: "Ceci s\u2019est d\xE9j\xE0 produit.",
        german: "Dies ist bereits geschehen.",
        indonesian: "Ini sudah terjadi."
      },
      timeStart: 45 / 60 * 100,
      duration: 1200
    },
    {
      id: 2,
      timestamps: "00:03:46 \u2014 00:05:24",
      text: {
        english: "You remembered it anyway",
        french: "Tu t\u2019en es souvenu quand m\xEAme",
        german: "Du hast dich trotzdem daran erinnert",
        indonesian: "Kamu tetap mengingatnya"
      },
      timeStart: 4 * 1e3 + 5 / 60 * 100,
      duration: 600
    },
    {
      id: 3,
      timestamps: "00:06:33 \u2014 00:07:44",
      text: {
        english: "You are still looking for clarity.",
        french: "Tu cherches encore la clart\xE9.",
        german: "Du suchst immer noch nach Klarheit.",
        indonesian: "Kamu masih mencari kejelasan."
      },
      timeStart: 7 * 1e3 + 2 / 60 * 100,
      duration: 400
    },
    {
      id: 4,
      timestamps: "00:07:48 \u2014 00:08:50",
      text: {
        english: "This may not be important.",
        french: "Ce n\u2019est peut-\xEAtre pas important.",
        german: "Das ist vielleicht nicht wichtig.",
        indonesian: "Ini mungkin tidak penting."
      },
      timeStart: 7 * 1e3 + 39 / 60 * 100,
      duration: 1200
    },
    {
      id: 5,
      timestamps: "00:09:53 \u2014 00:11:49",
      text: {
        english: "Stillness is often mistaken for depth.",
        french: "L\u2019immobilit\xE9 est souvent confondue avec la profondeur.",
        german: "Stille wird oft mit Tiefe verwechselt.",
        indonesian: "Diam sering disalahartikan sebagai kedalaman."
      },
      timeStart: 7 * 1e3 + 56 / 60 * 100,
      duration: 1200
    },
    {
      id: 6,
      timestamps: "00:15:07 \u2014 00:16:00",
      text: {
        english: "xx px/s",
        french: "xx px/s",
        german: "xx px/s",
        indonesian: "xx px/s"
      },
      timeStart: 9 * 1e3 + 53 / 60 * 100,
      duration: 1200
    },
    {
      id: 7,
      timestamps: "00:19:00 \u2014 00:20:59",
      text: {
        english: "(time dilates)",
        french: "(le temps se dilate)",
        german: "(die Zeit dehnt sich)",
        indonesian: "(waktu melambat)"
      },
      timeStart: 15 * 1e3 + 7 / 60 * 100,
      duration: 1200
    },
    {
      id: 8,
      timestamps: "00:23:29 \u2014 00:25:03",
      text: {
        english: "[something changes off-screen]",
        french: "[quelque chose change hors champ]",
        german: "[etwas ver\xE4ndert sich au\xDFerhalb des Bildes]",
        indonesian: "[sesuatu berubah di luar layar]"
      },
      timeStart: 19 * 1e3,
      duration: 1200
    },
    {
      id: 9,
      timestamps: "00:26:14 \u2014 00:28:44",
      text: {
        english: '"Are you talking to yourself?"',
        french: "\xAB Tu te parles \xE0 toi-m\xEAme ? \xBB",
        german: "\u201ERedest du mit dir selbst?\u201C",
        indonesian: '"Apakah kamu bicara sendiri?"'
      },
      timeStart: 23 * 1e3 + 29 / 60 * 100,
      duration: 1200
    },
    {
      id: 10,
      timestamps: "00:31:00 \u2014 00:31:15",
      text: {
        english: "ths sctn hs bn rdc",
        french: "ctt sctn a \xE9t\xE9 rdg\xE9e",
        german: "dsr abschntt wrd geschwrzt",
        indonesian: "bgn ini tlh disnsor"
      },
      timeStart: 26 * 1e3 + 14 / 60 * 100,
      duration: 1200
    },
    {
      id: 13,
      timestamps: "00:34:15 \u2014 00:36:53",
      text: {
        english: "what were we?",
        french: "qu\u2019\xE9tions-nous ?",
        german: "was waren wir?",
        indonesian: "apa kita dulu?"
      },
      timeStart: 34 * 1e3 + 15 / 60 * 100,
      duration: 1200
    },
    {
      id: 14,
      timestamps: "00:40:00 \u2014 00:41:51",
      text: {
        english: "Some shot lingers too long.",
        french: "Un plan s\u2019attarde trop longtemps.",
        german: "Eine Einstellung verweilt zu lange.",
        indonesian: "Satu adegan bertahan terlalu lama."
      },
      timeStart: 40 * 1e3,
      duration: 1200
    },
    {
      id: 15,
      timestamps: "00:43:20 \u2014 00:45:19",
      text: {
        english: "Something may have already happened.",
        french: "Quelque chose s\u2019est peut-\xEAtre d\xE9j\xE0 produit.",
        german: "Etwas ist vielleicht schon geschehen.",
        indonesian: "Sesuatu mungkin sudah terjadi."
      },
      timeStart: 43 * 1e3 + 20 / 60 * 100,
      duration: 1200
    },
    {
      id: 16,
      timestamps: "00:50:57 \u2014 00:53:45",
      text: {
        english: ">> time stamp",
        french: ">> horodatage",
        german: ">> Zeitstempel",
        indonesian: ">> stempel waktu"
      },
      timeStart: 50 * 1e3 + 57 / 60 * 100,
      duration: 1200
    },
    {
      id: 17,
      timestamps: "00:55:53 \u2014 00:56:29",
      text: {
        english: "IMG_2392.MOV is playing.",
        french: "IMG_2392.MOV est en lecture.",
        german: "IMG_2392.MOV wird abgespielt.",
        indonesian: "IMG_2392.MOV sedang diputar."
      },
      timeStart: 55 * 1e3 + 53 / 60 * 100,
      duration: 1200
    },
    {
      id: 18,
      timestamps: "00:56:30 \u2014 00:58:19",
      text: {
        english: "IMG_4656.MOV is playing.",
        french: "IMG_4656.MOV est en lecture.",
        german: "IMG_4656.MOV wird abgespielt.",
        indonesian: "IMG_4656.MOV sedang diputar."
      },
      timeStart: 56 * 1e3 + 30 / 60 * 100,
      duration: 1200
    },
    {
      id: 19,
      timestamps: "01:07:43 \u2014 01:08:40",
      text: {
        english: "This was demolished in 2021.",
        french: "Ceci a \xE9t\xE9 d\xE9moli en 2021.",
        german: "Dies wurde 2021 abgerissen.",
        indonesian: "Ini dirobohkan pada tahun 2021."
      },
      timeStart: 1 * 60 * 1e3 + 7 * 1e3 + 43 / 60 * 100,
      duration: 1200
    },
    {
      id: 20,
      timestamps: "01:17:35 \u2014 01:18:59",
      text: {
        english: "Are you still willing?",
        french: "Es-tu toujours pr\xEAt(e) ?",
        german: "Bist du noch bereit?",
        indonesian: "Apakah kamu masih bersedia?"
      },
      timeStart: 1 * 60 * 1e3 + 17 * 1e3 + 35 / 60 * 100,
      duration: 1200
    },
    {
      id: 21,
      timestamps: "01:21:15 \u2014 01:22:43",
      text: {
        english: "How\u2019s this relevant here?",
        french: "En quoi est-ce pertinent ici ?",
        german: "Was hat das hiermit zu tun?",
        indonesian: "Apa relevansinya di sini?"
      },
      timeStart: 1 * 60 * 1e3 + 22 * 1e3 + 44 / 60 * 100,
      duration: 1200
    },
    {
      id: 22,
      timestamps: "01:24:20 \u2014 01:26:20",
      text: {
        english: "Prayer for all beings.",
        french: "Pri\xE8re pour tous les \xEAtres.",
        german: "Gebet f\xFCr alle Wesen.",
        indonesian: "Doa untuk semua makhluk."
      },
      timeStart: 1 * 60 * 1e3 + 24 * 1e3 + 20 / 60 * 100,
      duration: 1200
    },
    {
      id: 23,
      timestamps: "01:29:10 \u2014 01:30:34",
      text: {
        english: "[silence continues]",
        french: "[le silence continue]",
        german: "[die Stille h\xE4lt an]",
        indonesian: "[keheningan berlanjut]"
      },
      timeStart: 1 * 60 * 1e3 + 29 * 1e3 + 10 / 60 * 100,
      duration: 1200
    },
    {
      id: 24,
      timestamps: "01:37:47 \u2014 01:38:42",
      text: {
        english: "Year of the ocean...",
        french: "Ann\xE9e de l\u2019oc\xE9an...",
        german: "Jahr des Ozeans...",
        indonesian: "Tahun laut..."
      },
      timeStart: 1 * 60 * 1e3 + 37 * 1e3 + 47 / 60 * 100,
      duration: 1200
    },
    {
      id: 25,
      timestamps: "01:38:43 \u2014 01:40:27",
      text: {
        english: ">> activity",
        french: ">> activit\xE9",
        german: ">> Aktivit\xE4t",
        indonesian: ">> aktivitas"
      },
      timeStart: 1 * 60 * 1e3 + 38 * 1e3 + 43 / 60 * 100,
      duration: 1200
    },
    {
      id: 26,
      timestamps: "01:45:38 \u2014 01:48:27",
      text: {
        english: "You have already seen this.",
        french: "Tu as d\xE9j\xE0 vu ceci.",
        german: "Du hast das schon gesehen.",
        indonesian: "Kamu sudah melihat ini sebelumnya."
      },
      timeStart: 1 * 60 * 1e3 + 46 * 1e3 + 41 / 60 * 100,
      duration: 1200
    }
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
    const root = document.documentElement;
    root.style.setProperty(
      "--caption-font-family",
      `${quoteIfNeeded(settings.fontFamily)}, sans-serif`
    );
    root.style.setProperty("--caption-colour", settings.fontColour);
    root.style.setProperty("--caption-box-colour", settings.boxColour);
    root.setAttribute("lang", languageCodes[settings.language]);
    root.setAttribute("data-audio-description", settings.audioDescription);
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
  function playCaption() {
    if (isPaused2) return;
    const time = videoPlayer.getCurrentTime() * 1e3;
    const custom = customCaptions.find((c) => c.condition(pointerTracker.getState()));
    if (custom && currentId !== custom.id) createCaption(custom);
    else if (!currentId) {
      const currentMatch = captions.find(
        (c) => c.timeStart < time && c.timeStart + c.duration > time
      );
      if (currentMatch) {
        createCaption(currentMatch);
      }
    }
    requestAnimationFrame(playCaption);
  }
  function createCaption(caption) {
    const { id, text, duration } = caption;
    if (currentTimeout) clearTimeout(currentTimeout);
    if (currentElement) currentElement.remove();
    currentId = id;
    currentCaption = caption;
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
      const min = Math.min(0, viewport.clientWidth - track.offsetWidth);
      return Math.max(min, Math.min(0, px));
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
  var picker = document.querySelector("#settings-picker");
  var pickerTrack = document.querySelector("#picker-track");
  var pickerTrackInner = document.querySelector(
    "#picker-track-inner"
  );
  var pickerClose = document.querySelector("#picker-close");
  var activePickerKey = null;
  var pickerReturnFocus = null;
  var pickerDrag = makeDraggableTrack(pickerTrack, pickerTrackInner, () => {
    const active = updateActiveItem();
    if (active && activePickerKey) {
      setSetting(
        activePickerKey,
        active.dataset.value
      );
    }
  });
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
  function initSettingsPicker() {
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
  function initSettingsMenus() {
    const inlineSettings = document.querySelector("#settings-inline");
    const inlineMenu = createSettingsMenu(inlineSettings);
    const burgerButton = document.querySelector("#burger-button");
    const floatingMenu = document.querySelector("#settings-floating");
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
  initVideoPlayer();
  initCaptionsPlayer();
  initSettingsPicker();
  initSettingsMenus();
})();
