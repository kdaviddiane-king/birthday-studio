// ═══════════════════════════════════════════
//  MUSIC — Mélodies d'anniversaire
//  Générées via Web Audio API (aucun fichier externe)
// ═══════════════════════════════════════════

let audioCtx = null;
let musicNodes = [];
let musicPlaying = false;
let currentTrack = 0;
let musicLoop = null;

const TRACKS = [
  { id: 'happy',  nm: '🎂 Happy Birthday', desc: 'Le classique' },
  { id: 'piano',  nm: '🎹 Piano doux',      desc: 'Mélodie douce' },
  { id: 'festif', nm: '🎉 Festif',          desc: 'Ambiance fête' },
  { id: 'jazz',   nm: '🎷 Jazz',            desc: 'Lounge & cool' },
];

// Notes MIDI → fréquences
function freq(note, octave) {
  const notes = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const n = notes[note] + (octave + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}

// ── Mélodies ──
const MELODIES = {
  happy: [
    // Happy Birthday to You
    [freq('C',4),.25], [freq('C',4),.25], [freq('D',4),.5], [freq('C',4),.5],
    [freq('F',4),.5],  [freq('E',4),1],
    [freq('C',4),.25], [freq('C',4),.25], [freq('D',4),.5], [freq('C',4),.5],
    [freq('G',4),.5],  [freq('F',4),1],
    [freq('C',4),.25], [freq('C',4),.25], [freq('C',5),.5], [freq('A',4),.5],
    [freq('F',4),.5],  [freq('E',4),.5],  [freq('D',4),1],
    [freq('B',4),.25], [freq('B',4),.25], [freq('A',4),.5], [freq('F',4),.5],
    [freq('G',4),.5],  [freq('F',4),1.5],
  ],
  piano: [
    // Mélodie douce inventée
    [freq('E',4),.5], [freq('G',4),.5], [freq('A',4),1],
    [freq('G',4),.5], [freq('E',4),.5], [freq('D',4),1],
    [freq('C',4),.5], [freq('E',4),.5], [freq('G',4),1],
    [freq('A',4),.5], [freq('G',4),.5], [freq('E',4),1.5],
    [freq('F',4),.5], [freq('A',4),.5], [freq('C',5),1],
    [freq('B',4),.5], [freq('G',4),.5], [freq('E',4),1.5],
  ],
  festif: [
    // Ambiance festive rythmée
    [freq('C',5),.25], [freq('E',5),.25], [freq('G',5),.25], [freq('C',5),.25],
    [freq('E',5),.5],  [freq('G',5),.5],
    [freq('A',4),.25], [freq('C',5),.25], [freq('E',5),.25], [freq('A',4),.25],
    [freq('C',5),.5],  [freq('E',5),.5],
    [freq('F',4),.25], [freq('A',4),.25], [freq('C',5),.25], [freq('F',4),.25],
    [freq('A',4),.5],  [freq('C',5),.5],
    [freq('G',4),.25], [freq('B',4),.25], [freq('D',5),.25], [freq('G',5),.5],
    [freq('G',5),.25], [freq('F',5),.25], [freq('E',5),1],
  ],
  jazz: [
    // Jazz / swing
    [freq('C',4),.375], [freq('E',4),.125], [freq('G',4),.25], [freq('B',4),.25],
    [freq('A',4),.375], [freq('G',4),.125], [freq('F',4),.5],
    [freq('E',4),.375], [freq('D',4),.125], [freq('C',4),.25], [freq('E',4),.25],
    [freq('G',4),.75],  [0,.25],
    [freq('F',4),.375], [freq('A',4),.125], [freq('C',5),.25], [freq('E',5),.25],
    [freq('D',5),.375], [freq('C',5),.125], [freq('B',4),.5],
    [freq('G',4),.375], [freq('B',4),.125], [freq('D',5),.25], [freq('F',5),.25],
    [freq('E',5),.75],  [0,.5],
  ],
};

// ── Jouer une mélodie ──
function playMelody(trackId) {
  stopMusic();

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.warn('Web Audio non supporté');
    return;
  }

  const melody = MELODIES[trackId] || MELODIES.happy;
  const tempo = trackId === 'festif' ? 0.38 : 0.45;
  let time = audioCtx.currentTime + 0.1;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  musicNodes.push(masterGain);

  // Reverb léger
  const convolver = audioCtx.createConvolver();
  const reverbLen = audioCtx.sampleRate * 1.5;
  const reverbBuf = audioCtx.createBuffer(2, reverbLen, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = reverbBuf.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/reverbLen, 2);
  }
  convolver.buffer = reverbBuf;
  const reverbGain = audioCtx.createGain();
  reverbGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  convolver.connect(reverbGain);
  reverbGain.connect(masterGain);
  musicNodes.push(convolver, reverbGain);

  melody.forEach(([f, dur]) => {
    if (f === 0) { time += dur * tempo; return; }

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const type = trackId === 'jazz' ? 'triangle' : trackId === 'festif' ? 'square' : 'sine';
    osc.type = type;
    osc.frequency.setValueAtTime(f, time);

    // Enveloppe ADSR
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.7, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.4, time + dur * tempo * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * tempo * 0.95);

    osc.connect(gain);
    gain.connect(masterGain);
    gain.connect(convolver);

    osc.start(time);
    osc.stop(time + dur * tempo);
    musicNodes.push(osc, gain);

    time += dur * tempo;
  });

  musicPlaying = true;
  updateMusicUI();

  // Boucle automatique
  const totalDur = melody.reduce((s, [,d]) => s + d, 0) * tempo * 1000 + 200;
  musicLoop = setTimeout(() => {
    if (musicPlaying) playMelody(trackId);
  }, totalDur);
}

// ── Arrêter ──
function stopMusic() {
  clearTimeout(musicLoop);
  musicNodes.forEach(n => { try { n.disconnect(); if (n.stop) n.stop(); } catch(e){} });
  musicNodes = [];
  if (audioCtx) { try { audioCtx.close(); } catch(e){} audioCtx = null; }
  musicPlaying = false;
  updateMusicUI();
}

// ── Toggle play/pause ──
function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
  } else {
    playMelody(TRACKS[currentTrack].id);
  }
}

// ── Changer de piste ──
function selectTrack(idx) {
  currentTrack = idx;
  document.querySelectorAll('.trk').forEach((el, i) => {
    el.classList.toggle('sel', i === idx);
  });
  if (musicPlaying) playMelody(TRACKS[idx].id);
}

// ── Mettre à jour l'UI ──
function updateMusicUI() {
  const btn = document.getElementById('fxmusic');
  if (!btn) return;
  btn.classList.toggle('lit', musicPlaying);
  btn.querySelector('.fx-icon').textContent = musicPlaying ? '⏸' : '🎵';
  btn.querySelector('.fx-label').textContent = musicPlaying ? 'Pause' : 'Musique';

  const panel = document.getElementById('music-panel');
  if (panel) {
    const ind = panel.querySelector('.music-playing-indicator');
    if (ind) ind.style.display = musicPlaying ? 'flex' : 'none';
  }
}

// ── Auto-play quand la carte est générée ──
function autoPlayMusic() {
  if (!musicPlaying) {
    setTimeout(() => playMelody(TRACKS[currentTrack].id), 800);
  }
}
