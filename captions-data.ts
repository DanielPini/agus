import type { State } from "./pointer-tracker.js";
import type { Caption, CaptionText, CustomCaption } from "./captions-types.js";

// Parses "MM:SS:FF — MM:SS:FF" (minutes, seconds, sixtieths-of-a-second —
// the format pulled straight from the video, not HH:MM:SS) into millisecond
// offsets.
function parseTimestamps(timestamps: string): { timeStart: number; duration: number } {
  const match = timestamps.match(
    /^(\d{2}):(\d{2}):(\d{2})\s*—\s*(\d{2}):(\d{2}):(\d{2})$/,
  );
  if (!match) throw new Error(`Unrecognized timestamp format: "${timestamps}"`);

  const [, m1, s1, f1, m2, s2, f2] = match;
  const toMs = (m: string, s: string, f: string) =>
    (Number(m) * 60 + Number(s) + Number(f) / 60) * 1000;

  const timeStart = toMs(m1, s1, f1);
  const timeEnd = toMs(m2, s2, f2);
  return { timeStart, duration: timeEnd - timeStart };
}

function caption(id: number, timestamps: string, text: CaptionText): Caption {
  return { id, timestamps, text, ...parseTimestamps(timestamps) };
}

export const captions: Caption[] = [
  caption(1, "00:00:45 — 00:03:24", {
    english: "This was not intended to be remembered",
    french: "Ceci n’était pas destiné à être mémorisé",
    german: "Dies war nicht dazu bestimmt, erinnert zu werden",
    indonesian: "Ini tidak dimaksudkan untuk diingat",
  }),
  caption(2, "00:04:05 — 00:05:38", {
    english: "They’ve given this various names.",
    french: "On lui a donné plusieurs noms.",
    german: "Man hat dem verschiedene Namen gegeben.",
    indonesian: "Ini telah diberi berbagai nama.",
  }),
  caption(3, "00:07:02 — 00:07:38", {
    english: "You are looking for clarity.",
    french: "Tu cherches la clarté.",
    german: "Du suchst nach Klarheit.",
    indonesian: "Kamu sedang mencari kejelasan.",
  }),
  caption(4, "00:07:39 — 00:07:55", {
    english: "This may not be important.",
    french: "Ce n’est peut-être pas important.",
    german: "Das ist vielleicht nicht wichtig.",
    indonesian: "Ini mungkin tidak penting.",
  }),
  caption(5, "00:07:56 — 00:09:01", {
    english: "You are moving too fast.",
    french: "Tu vas trop vite.",
    german: "Du bewegst dich zu schnell.",
    indonesian: "Kamu bergerak terlalu cepat.",
  }),
  caption(6, "00:09:53 — 00:11:49", {
    english: "Stillness is often mistaken for depth.",
    french: "L’immobilité est souvent confondue avec la profondeur.",
    german: "Stille wird oft mit Tiefe verwechselt.",
    indonesian: "Diam sering disalahartikan sebagai kedalaman.",
  }),
  caption(7, "00:15:07 — 00:16:00", {
    english: "This has already occured.",
    french: "Ceci s’est déjà produit.",
    german: "Dies ist bereits geschehen.",
    indonesian: "Ini sudah terjadi.",
  }),
  caption(8, "00:19:00 — 00:20:59", {
    english: "00:19-00.21 (time dilates)",
    french: "00:19-00.21 (le temps se dilate)",
    german: "00:19-00.21 (die Zeit dehnt sich)",
    indonesian: "00:19-00.21 (waktu melambat)",
  }),
  caption(9, "00:23:29 — 00:25:03", {
    english: "[something changes off-screen]",
    french: "[quelque chose change hors champ]",
    german: "[etwas verändert sich außerhalb des Bildes]",
    indonesian: "[sesuatu berubah di luar layar]",
  }),
  caption(10, "00:26:14 — 00:28:44", {
    english: '"Are you talking to yourself?"',
    french: "« Tu te parles à toi-même ? »",
    german: "„Redest du mit dir selbst?“",
    indonesian: '"Apakah kamu bicara sendiri?"',
  }),
  caption(11, "00:31:00 — 00:31:15", {
    english: "ths sctn hs bn rdc",
    french: "ctt sctn a été rdgée",
    german: "dsr abschntt wrd geschwrzt",
    indonesian: "bgn ini tlh disnsor",
  }),
  caption(12, "00:34:15 — 00:36:53", {
    english: "what were we?",
    french: "qu’étions-nous ?",
    german: "was waren wir?",
    indonesian: "apa kita dulu?",
  }),
  caption(13, "00:40:00 — 00:41:51", {
    english: "Some shot lingers too long.",
    french: "Un plan s’attarde trop longtemps.",
    german: "Eine Einstellung verweilt zu lange.",
    indonesian: "Satu adegan bertahan terlalu lama.",
  }),
  caption(14, "00:43:20 — 00:45:59", {
    english: "You are waiting for something to happen.",
    french: "Tu attends que quelque chose se passe.",
    german: "Du wartest darauf, dass etwas geschieht.",
    indonesian: "Kamu menunggu sesuatu terjadi.",
  }),
  caption(15, "00:50:57 — 00:53:59", {
    english: "A portrait video rotated landscape.",
    french: "Une vidéo portrait tournée en paysage.",
    german: "Ein Hochformatvideo, ins Querformat gedreht.",
    indonesian: "Video potret yang diputar menjadi lanskap.",
  }),
  caption(16, "00:55:53 — 00:56:29", {
    english: "IMG_2392.MOV is playing.",
    french: "IMG_2392.MOV est en lecture.",
    german: "IMG_2392.MOV wird abgespielt.",
    indonesian: "IMG_2392.MOV sedang diputar.",
  }),
  caption(17, "00:56:30 — 00:58:19", {
    english: "IMG_4656.MOV is playing.",
    french: "IMG_4656.MOV est en lecture.",
    german: "IMG_4656.MOV wird abgespielt.",
    indonesian: "IMG_4656.MOV sedang diputar.",
  }),
  caption(18, "01:07:43 — 01:08:40", {
    english: "This was demolished in 2021.",
    french: "Ceci a été démoli en 2021.",
    german: "Dies wurde 2021 abgerissen.",
    indonesian: "Ini dirobohkan pada tahun 2021.",
  }),
  caption(19, "01:17:35 — 01:18:59", {
    english: "Are you still willing?",
    french: "Es-tu toujours prêt(e) ?",
    german: "Bist du noch bereit?",
    indonesian: "Apakah kamu masih bersedia?",
  }),
  caption(20, "01:22:44 — 01:24:19", {
    english: "This was about 5,500km from here.",
    french: "C’était à environ 5 500 km d’ici.",
    german: "Das war etwa 5.500 km von hier entfernt.",
    indonesian: "Ini sekitar 5.500 km dari sini.",
  }),
  caption(21, "01:24:20 — 01:26:20", {
    english: "Prayer for all beings.",
    french: "Prière pour tous les êtres.",
    german: "Gebet für alle Wesen.",
    indonesian: "Doa untuk semua makhluk.",
  }),
  caption(22, "01:29:10 — 01:30:34", {
    english: "[silence continues]",
    french: "[le silence continue]",
    german: "[die Stille hält an]",
    indonesian: "[keheningan berlanjut]",
  }),
  caption(23, "01:37:47 — 01:38:42", {
    english: "Year of the ocean...",
    french: "Année de l’océan...",
    german: "Jahr des Ozeans...",
    indonesian: "Tahun laut...",
  }),
  caption(24, "01:38:43 — 01:40:27", {
    english: "I remember there was a hill behind.",
    french: "Je me souviens qu’il y avait une colline derrière.",
    german: "Ich erinnere mich, dass dahinter ein Hügel war.",
    indonesian: "Aku ingat dulu ada bukit di belakang.",
  }),
  caption(25, "01:46:41 — 01:48:27", {
    english: "[seen]",
    french: "[vu]",
    german: "[gesehen]",
    indonesian: "[terlihat]",
  }),
];

export const captionsLoop2: Caption[] = [
  caption(1, "00:00:45 — 00:03:05", {
    english: "This has already occured.",
    french: "Ceci s’est déjà produit.",
    german: "Dies ist bereits geschehen.",
    indonesian: "Ini sudah terjadi.",
  }),
  caption(2, "00:03:46 — 00:05:24", {
    english: "You remembered it anyway",
    french: "Tu t’en es souvenu quand même",
    german: "Du hast dich trotzdem daran erinnert",
    indonesian: "Kamu tetap mengingatnya",
  }),
  caption(3, "00:06:33 — 00:07:44", {
    english: "You are still looking for clarity.",
    french: "Tu cherches encore la clarté.",
    german: "Du suchst immer noch nach Klarheit.",
    indonesian: "Kamu masih mencari kejelasan.",
  }),
  caption(4, "00:07:48 — 00:08:50", {
    english: "This may not be important.",
    french: "Ce n’est peut-être pas important.",
    german: "Das ist vielleicht nicht wichtig.",
    indonesian: "Ini mungkin tidak penting.",
  }),
  caption(5, "00:09:53 — 00:11:49", {
    english: "Stillness is often mistaken for depth.",
    french: "L’immobilité est souvent confondue avec la profondeur.",
    german: "Stille wird oft mit Tiefe verwechselt.",
    indonesian: "Diam sering disalahartikan sebagai kedalaman.",
  }),
  caption(6, "00:15:07 — 00:16:00", {
    english: "xx px/s",
    french: "xx px/s",
    german: "xx px/s",
    indonesian: "xx px/s",
  }),
  caption(7, "00:19:00 — 00:20:59", {
    english: "(time dilates)",
    french: "(le temps se dilate)",
    german: "(die Zeit dehnt sich)",
    indonesian: "(waktu melambat)",
  }),
  caption(8, "00:23:29 — 00:25:03", {
    english: "[something changes off-screen]",
    french: "[quelque chose change hors champ]",
    german: "[etwas verändert sich außerhalb des Bildes]",
    indonesian: "[sesuatu berubah di luar layar]",
  }),
  caption(9, "00:26:14 — 00:28:44", {
    english: '"Are you talking to yourself?"',
    french: "« Tu te parles à toi-même ? »",
    german: "„Redest du mit dir selbst?“",
    indonesian: '"Apakah kamu bicara sendiri?"',
  }),
  caption(10, "00:31:00 — 00:31:15", {
    english: "ths sctn hs bn rdc",
    french: "ctt sctn a été rdgée",
    german: "dsr abschntt wrd geschwrzt",
    indonesian: "bgn ini tlh disnsor",
  }),
  caption(13, "00:34:15 — 00:36:53", {
    english: "what were we?",
    french: "qu’étions-nous ?",
    german: "was waren wir?",
    indonesian: "apa kita dulu?",
  }),
  caption(14, "00:40:00 — 00:41:51", {
    english: "Some shot lingers too long.",
    french: "Un plan s’attarde trop longtemps.",
    german: "Eine Einstellung verweilt zu lange.",
    indonesian: "Satu adegan bertahan terlalu lama.",
  }),
  caption(15, "00:43:20 — 00:45:19", {
    english: "Something may have already happened.",
    french: "Quelque chose s’est peut-être déjà produit.",
    german: "Etwas ist vielleicht schon geschehen.",
    indonesian: "Sesuatu mungkin sudah terjadi.",
  }),
  caption(16, "00:50:57 — 00:53:45", {
    english: ">> time stamp",
    french: ">> horodatage",
    german: ">> Zeitstempel",
    indonesian: ">> stempel waktu",
  }),
  caption(17, "00:55:53 — 00:56:29", {
    english: "IMG_2392.MOV is playing.",
    french: "IMG_2392.MOV est en lecture.",
    german: "IMG_2392.MOV wird abgespielt.",
    indonesian: "IMG_2392.MOV sedang diputar.",
  }),
  caption(18, "00:56:30 — 00:58:19", {
    english: "IMG_4656.MOV is playing.",
    french: "IMG_4656.MOV est en lecture.",
    german: "IMG_4656.MOV wird abgespielt.",
    indonesian: "IMG_4656.MOV sedang diputar.",
  }),
  caption(19, "01:07:43 — 01:08:40", {
    english: "This was demolished in 2021.",
    french: "Ceci a été démoli en 2021.",
    german: "Dies wurde 2021 abgerissen.",
    indonesian: "Ini dirobohkan pada tahun 2021.",
  }),
  caption(20, "01:17:35 — 01:18:59", {
    english: "Are you still willing?",
    french: "Es-tu toujours prêt(e) ?",
    german: "Bist du noch bereit?",
    indonesian: "Apakah kamu masih bersedia?",
  }),
  caption(21, "01:21:15 — 01:22:43", {
    english: "How’s this relevant here?",
    french: "En quoi est-ce pertinent ici ?",
    german: "Was hat das hiermit zu tun?",
    indonesian: "Apa relevansinya di sini?",
  }),
  caption(22, "01:24:20 — 01:26:20", {
    english: "Prayer for all beings.",
    french: "Prière pour tous les êtres.",
    german: "Gebet für alle Wesen.",
    indonesian: "Doa untuk semua makhluk.",
  }),
  caption(23, "01:29:10 — 01:30:34", {
    english: "[silence continues]",
    french: "[le silence continue]",
    german: "[die Stille hält an]",
    indonesian: "[keheningan berlanjut]",
  }),
  caption(24, "01:37:47 — 01:38:42", {
    english: "Year of the ocean...",
    french: "Année de l’océan...",
    german: "Jahr des Ozeans...",
    indonesian: "Tahun laut...",
  }),
  caption(25, "01:38:43 — 01:40:27", {
    english: ">> activity",
    french: ">> activité",
    german: ">> Aktivität",
    indonesian: ">> aktivitas",
  }),
  caption(26, "01:45:38 — 01:48:27", {
    english: "You have already seen this.",
    french: "Tu as déjà vu ceci.",
    german: "Du hast das schon gesehen.",
    indonesian: "Kamu sudah melihat ini sebelumnya.",
  }),
];

export const customCaptions: CustomCaption[] = [
  {
    id: 5,
    text: {
      english: "You're moving too fast",
      french: "Tu vas trop vite",
      german: "Du bewegst dich zu schnell",
      indonesian: "Kamu bergerak terlalu cepat",
    },
    condition: (state: State) => state.speed > 6,
    duration: 1000,
  },
  {
    id: 6,
    text: {
      english: "Wait, don't leave",
      french: "Attends, ne pars pas",
      german: "Warte, geh nicht",
      indonesian: "Tunggu, jangan pergi",
    },
    condition: (state: State) =>
      state.position.y < 100 && state.directionY === "up",
    duration: 1000,
  },
];
