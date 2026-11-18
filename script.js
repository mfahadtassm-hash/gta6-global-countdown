const RELEASE_SCHEDULE = [
  {
    id: 'nz',
    regionName: 'New Zealand & Pacific Wave (Est.)',
    countryName: 'NEW ZEALAND',
    flag: '🇳🇿',
    timeZone: 'Pacific/Auckland',
    launchISO: '2026-11-19T00:00:00+13:00',
    mapCoords: { x: 915, y: 410 }
  },
  {
    id: 'au',
    regionName: 'Australia Eastern Wave (Est.)',
    countryName: 'AUSTRALIA',
    flag: '🇦🇺',
    timeZone: 'Australia/Sydney',
    launchISO: '2026-11-19T00:00:00+11:00',
    mapCoords: { x: 845, y: 362 }
  },
  {
    id: 'jp',
    regionName: 'Japan & South Korea (Est.)',
    countryName: 'JAPAN',
    flag: '🇯🇵',
    timeZone: 'Asia/Tokyo',
    launchISO: '2026-11-19T00:00:00+09:00',
    mapCoords: { x: 845, y: 158 }
  },
  {
    id: 'sg',
    regionName: 'Southeast Asia & China (Est.)',
    countryName: 'CHINA - PHILIPPINES',
    flag: '🇨🇳',
    timeZone: 'Asia/Shanghai',
    launchISO: '2026-11-19T00:00:00+08:00',
    mapCoords: { x: 755, y: 268 }
  },
  {
    id: 'in',
    regionName: 'India Standard Wave (Est.)',
    countryName: 'INDIA',
    flag: '🇮🇳',
    timeZone: 'Asia/Kolkata',
    launchISO: '2026-11-19T00:00:00+05:30',
    mapCoords: { x: 688, y: 218 }
  },
  {
    id: 'pk',
    regionName: 'Pakistan & Central Asia (Est.)',
    countryName: 'PAKISTAN',
    flag: '🇵🇰',
    timeZone: 'Asia/Karachi',
    launchISO: '2026-11-19T00:00:00+05:00',
    mapCoords: { x: 658, y: 192 }
  },
  {
    id: 'ae',
    regionName: 'UAE & Gulf Region (Est.)',
    countryName: 'UAE - OMAN',
    flag: '🇦🇪',
    timeZone: 'Asia/Dubai',
    launchISO: '2026-11-19T00:00:00+04:00',
    mapCoords: { x: 612, y: 210 }
  },
  {
    id: 'eu',
    regionName: 'Central Europe Wave (Est.)',
    countryName: 'GERMANY - FRANCE',
    flag: '🇩🇪',
    timeZone: 'Europe/Berlin',
    launchISO: '2026-11-19T00:00:00+01:00',
    mapCoords: { x: 502, y: 122 }
  },
  {
    id: 'uk',
    regionName: 'United Kingdom & Ireland (Est.)',
    countryName: 'UK - PORTUGAL',
    flag: '🇬🇧',
    timeZone: 'Europe/London',
    launchISO: '2026-11-19T00:00:00+00:00',
    mapCoords: { x: 462, y: 115 }
  },
  {
    id: 'br',
    regionName: 'Brazil & South America (Est.)',
    countryName: 'BRAZIL - ARGENTINA',
    flag: '🇧🇷',
    timeZone: 'America/Sao_Paulo',
    launchISO: '2026-11-19T00:00:00-03:00',
    mapCoords: { x: 298, y: 344 }
  },
  {
    id: 'us-east',
    regionName: 'Leonida / Vice City & US East (Est.)',
    countryName: 'NEW YORK - TORONTO',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
    launchISO: '2026-11-19T00:00:00-05:00',
    mapCoords: { x: 238, y: 182 }
  },
  {
    id: 'us-west',
    regionName: 'US West Coast & Pacific (Est.)',
    countryName: 'CALIFORNIA - VANCOUVER',
    flag: '🇺🇸',
    timeZone: 'America/Los_Angeles',
    launchISO: '2026-11-19T00:00:00-08:00',
    mapCoords: { x: 142, y: 158 }
  }
];

const SCHEDULE = RELEASE_SCHEDULE
  .map((item) => ({
    ...item,
    targetMs: new Date(item.launchISO).getTime(),
    simulatedLaunched: false
  }))
  .sort((a, b) => a.targetMs - b.targetMs);

let activeIndex = 0;
let isCelebrating = false;
let celebrationTimeout = null;
let inspectedIndex = null;

const dom = {
  phaseBadge: document.getElementById('phaseBadge'),
  regionProgressText: document.getElementById('regionProgressText'),
  activeFlag: document.getElementById('activeFlag'),
  activeCountry: document.getElementById('activeCountry'),
  activeRegionSub: document.getElementById('activeRegionSub'),
  cdDays: document.getElementById('cdDays'),
  cdHours: document.getElementById('cdHours'),
  cdMinutes: document.getElementById('cdMinutes'),
  cdSeconds: document.getElementById('cdSeconds'),
  regionLocalClock: document.getElementById('regionLocalClock'),
  regionTargetLocal: document.getElementById('regionTargetLocal'),
  launchedCountStat: document.getElementById('launchedCountStat'),
  isoMarkersLayer: document.getElementById('isoMarkersLayer'),
  isoSequenceTrack: document.getElementById('isoSequenceTrack'),
  isoSequenceActiveLine: document.getElementById('isoSequenceActiveLine'),
  isoHudCardsLayer: document.getElementById('isoHudCardsLayer'),
  rolloutStrip: document.getElementById('rolloutStrip'),
  celebrationOverlay: document.getElementById('celebrationOverlay'),
  celebFlag: document.getElementById('celebFlag'),
  celebTitle: document.getElementById('celebTitle'),
  celebRegion: document.getElementById('celebRegion'),
  celebNextHint: document.getElementById('celebNextHint'),
  audioToggleBtn: document.getElementById('audioToggleBtn'),
  audioIcon: document.getElementById('audioIcon'),
  audioLabel: document.getElementById('audioLabel'),
  volumeSlider: document.getElementById('volumeSlider'),
  simulateLaunchBtn: document.getElementById('simulateLaunchBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  bgAudioElement: document.getElementById('bgAudioElement'),
  celebrationSfx: document.getElementById('celebrationSfx')
};

class HybridAudioEngine {
  constructor() {
    this.useMp3 = true;
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.stepTimer = null;
    this.stepIndex = 0;
    this.volume = 0.5;
    this.restorePreference();
  }

  restorePreference() {
    try {
      const savedVol = localStorage.getItem('leonida_audio_vol');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
        dom.volumeSlider.value = this.volume;
        if (dom.bgAudioElement) dom.bgAudioElement.volume = this.volume;
        if (dom.celebrationSfx) dom.celebrationSfx.volume = this.volume;
      }
    } catch (_) {}
  }

  savePreference() {
    try {
      localStorage.setItem('leonida_audio_vol', String(this.volume));
    } catch (_) {}
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (dom.bgAudioElement) dom.bgAudioElement.volume = this.volume;
    if (dom.celebrationSfx) dom.celebrationSfx.volume = this.volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.04);
    }
    this.savePreference();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start() {
    this.isPlaying = true;
    if (dom.bgAudioElement) {
      dom.bgAudioElement.volume = this.volume;
      dom.bgAudioElement.play().then(() => {
        // MP3 playback successful
        this.useMp3 = true;
      }).catch(() => {
        // Fallback to Web Audio API synth if MP3 file (assets/launch-synth.mp3) is not found
        this.useMp3 = false;
        this.startSynth();
      });
    } else {
      this.startSynth();
    }
  }

  stop() {
    this.isPlaying = false;
    if (dom.bgAudioElement) {
      dom.bgAudioElement.pause();
    }
    this.stopSynth();
  }

  playTaddaaa() {
    if (dom.celebrationSfx && dom.celebrationSfx.src) {
      dom.celebrationSfx.currentTime = 0;
      dom.celebrationSfx.volume = this.volume;
      dom.celebrationSfx.play().catch(() => {
        this.playSynthTaddaaa();
      });
    } else {
      this.playSynthTaddaaa();
    }
  }

  initSynthContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startSynth() {
    this.initSynthContext();
    this.stepIndex = 0;
    const bassProgression = [110.0, 110.0, 110.0, 110.0, 87.31, 87.31, 87.31, 87.31, 65.41, 65.41, 65.41, 65.41, 98.00, 98.00, 98.00, 98.00];
    const padChords = [
      [220.0, 261.63, 329.63, 493.88],
      [174.61, 220.0, 261.63, 329.63],
      [130.81, 196.0, 246.94, 329.63],
      [196.0, 246.94, 293.66, 392.0]
    ];

    if (this.stepTimer) clearInterval(this.stepTimer);
    this.stepTimer = setInterval(() => {
      if (!this.isPlaying || this.useMp3 || !this.ctx) return;
      const now = this.ctx.currentTime;
      const barStep = this.stepIndex % 16;
      const chordIdx = Math.floor((this.stepIndex % 64) / 16);

      const bassFreq = bassProgression[chordIdx * 4 + (barStep % 4)];
      this.triggerSynthNote(bassFreq, 'sawtooth', 0.13, 0.14, now, 340);

      if (barStep === 0) {
        padChords[chordIdx].forEach((freq) => {
          this.triggerSynthNote(freq, 'triangle', 0.04, 2.2, now, 950);
        });
      }

      if (barStep % 4 === 2) {
        const arpNotes = padChords[chordIdx];
        const note = arpNotes[(this.stepIndex / 2) % arpNotes.length] * 2;
        this.triggerSynthNote(note, 'sine', 0.03, 0.35, now, 1600);
      }

      this.stepIndex = (this.stepIndex + 1) % 256;
    }, 145);
  }

  stopSynth() {
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  triggerSynthNote(freq, type, peakGain, duration, startTime, filterCutoff) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (_) {}
  }

  playSynthTaddaaa() {
    try {
      this.initSynthContext();
      const now = this.ctx.currentTime;
      const chord1 = [261.63, 329.63, 392.0];
      const chord2 = [349.23, 440.0, 523.25];
      const chord3 = [392.0, 493.88, 587.33, 783.99];

      chord1.forEach(f => this.triggerSynthNote(f, 'sawtooth', 0.12, 0.22, now, 1800));
      chord2.forEach(f => this.triggerSynthNote(f, 'sawtooth', 0.12, 0.22, now + 0.2, 1800));
      chord3.forEach(f => this.triggerSynthNote(f, 'triangle', 0.18, 1.2, now + 0.42, 2800));
    } catch (_) {}
  }
}

const audioEngine = new HybridAudioEngine();

function isRegionLaunched(region, nowMs) {
  return region.simulatedLaunched || nowMs >= region.targetMs;
}

function getNextUpcomingIndex(nowMs) {
  for (let i = 0; i < SCHEDULE.length; i++) {
    if (!isRegionLaunched(SCHEDULE[i], nowMs)) {
      return i;
    }
  }
  return -1;
}

function formatLocalClock(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());
  } catch (_) {
    return '--:--:--';
  }
}

function formatTargetLocalDate(isoString, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(isoString));
  } catch (_) {
    return 'Nov 19, 12:00 AM';
  }
}

function pad2(num) {
  return String(Math.max(0, Math.floor(num))).padStart(2, '0');
}

function buildRolloutStrip() {
  dom.rolloutStrip.innerHTML = '';
  SCHEDULE.forEach((region, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'region-chip';
    chip.dataset.index = idx;
    chip.innerHTML = `
      <span class="chip-flag">${region.flag}</span>
      <div class="chip-details">
        <span class="chip-name">${region.countryName}</span>
        <span class="chip-status" id="chipStatus-${region.id}">UPCOMING</span>
      </div>
    `;
    chip.addEventListener('click', () => {
      inspectedIndex = inspectedIndex === idx ? null : idx;
      updateDashboard();
    });
    dom.rolloutStrip.appendChild(chip);
  });
}

function renderIsometricMap(nowMs, focusIndex) {
  const points = SCHEDULE.map((r) => `${r.mapCoords.x},${r.mapCoords.y}`);
  dom.isoSequenceTrack.setAttribute('d', `M ${points.join(' L ')}`);

  const activeSlice = SCHEDULE.slice(0, Math.max(1, focusIndex + 1)).map(
    (r) => `${r.mapCoords.x},${r.mapCoords.y}`
  );
  dom.isoSequenceActiveLine.setAttribute('d', `M ${activeSlice.join(' L ')}`);

  dom.isoMarkersLayer.innerHTML = '';
  dom.isoHudCardsLayer.innerHTML = '';

  SCHEDULE.forEach((region, idx) => {
    const launched = isRegionLaunched(region, nowMs);
    const isFocus = idx === focusIndex;
    const { x, y } = region.mapCoords;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => {
      inspectedIndex = inspectedIndex === idx ? null : idx;
      updateDashboard();
    });

    if (isFocus) {
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('cx', x);
      pulse.setAttribute('cy', y);
      pulse.setAttribute('r', '12');
      pulse.setAttribute('class', 'marker-pulse-ring');
      g.appendChild(pulse);
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', isFocus ? '7' : launched ? '5' : '4.5');

    if (isFocus) {
      dot.setAttribute('fill', '#ff9e3b');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2.2');
      dot.setAttribute('filter', 'url(#isoNeonGlow)');
    } else if (launched) {
      dot.setAttribute('fill', '#10b981');
      dot.setAttribute('stroke', '#064e3b');
      dot.setAttribute('stroke-width', '1.5');
    } else {
      dot.setAttribute('fill', '#ff2e93');
      dot.setAttribute('stroke', '#1e1136');
      dot.setAttribute('stroke-width', '1.5');
    }

    g.appendChild(dot);
    dom.isoMarkersLayer.appendChild(g);

    const card = document.createElement('div');
    card.className = `map-region-card ${isFocus ? 'is-active' : ''} ${launched ? 'is-launched' : ''}`;
    card.style.left = `${(x / 1000) * 100}%`;
    card.style.top = `${(y / 520) * 100}%`;

    const dMs = Math.max(0, region.targetMs - nowMs);
    const hrs = Math.floor(dMs / (1000 * 60 * 60));
    const mins = Math.floor((dMs / (1000 * 60)) % 60);
    const secs = Math.floor((dMs / 1000) % 60);

    card.innerHTML = `
      <span class="hud-flag">${region.flag}</span>
      <div class="hud-details">
        <span class="hud-title">${region.countryName}</span>
        <span class="hud-timer">${launched ? 'UNLOCKED' : `${hrs}h ${pad2(mins)}m ${pad2(secs)}s`}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      inspectedIndex = inspectedIndex === idx ? null : idx;
      updateDashboard();
    });

    dom.isoHudCardsLayer.appendChild(card);
  });
}

function triggerCelebration(region, nextRegion) {
  if (isCelebrating) return;
  isCelebrating = true;

  dom.celebFlag.textContent = region.flag;
  dom.celebTitle.textContent = 'GTA VI HAS LAUNCHED!';
  dom.celebRegion.textContent = `NOW AVAILABLE IN ${region.countryName}`;
  dom.celebNextHint.textContent = nextRegion
    ? `Next up: ${nextRegion.flag} ${nextRegion.countryName}...`
    : 'All configured global regions are now live!';

  dom.celebrationOverlay.classList.add('is-visible');
  dom.celebrationOverlay.setAttribute('aria-hidden', 'false');
  
  audioEngine.playTaddaaa();

  clearTimeout(celebrationTimeout);
  celebrationTimeout = setTimeout(() => {
    dom.celebrationOverlay.classList.remove('is-visible');
    dom.celebrationOverlay.setAttribute('aria-hidden', 'true');
    isCelebrating = false;
    inspectedIndex = null;
    updateDashboard();
  }, 5600);
}

function updateDashboard() {
  const nowMs = Date.now();
  const nextUpcomingIdx = getNextUpcomingIndex(nowMs);

  if (!isCelebrating && nextUpcomingIdx !== -1 && nextUpcomingIdx > activeIndex) {
    const justLaunchedRegion = SCHEDULE[activeIndex];
    const upcomingRegion = SCHEDULE[nextUpcomingIdx];
    activeIndex = nextUpcomingIdx;
    triggerCelebration(justLaunchedRegion, upcomingRegion);
  } else if (nextUpcomingIdx === -1 && activeIndex < SCHEDULE.length) {
    const lastRegion = SCHEDULE[SCHEDULE.length - 1];
    activeIndex = SCHEDULE.length;
    triggerCelebration(lastRegion, null);
  } else if (nextUpcomingIdx !== -1) {
    activeIndex = nextUpcomingIdx;
  }

  const launchedCount = SCHEDULE.filter((r) => isRegionLaunched(r, nowMs)).length;
  dom.launchedCountStat.textContent = `${launchedCount} / ${SCHEDULE.length}`;

  const displayIndex =
    inspectedIndex !== null
      ? inspectedIndex
      : nextUpcomingIdx !== -1
      ? nextUpcomingIdx
      : SCHEDULE.length - 1;

  const currentRegion = SCHEDULE[displayIndex];
  const currentLaunched = isRegionLaunched(currentRegion, nowMs);

  dom.activeFlag.textContent = currentRegion.flag;
  dom.activeCountry.textContent = currentRegion.countryName;
  dom.activeRegionSub.textContent = currentRegion.regionName;
  dom.regionProgressText.textContent = `REGION ${displayIndex + 1} OF ${SCHEDULE.length}`;
  dom.regionLocalClock.textContent = formatLocalClock(currentRegion.timeZone);
  dom.regionTargetLocal.textContent = formatTargetLocalDate(
    currentRegion.launchISO,
    currentRegion.timeZone
  );

  if (nextUpcomingIdx === -1) {
    dom.phaseBadge.textContent = 'GLOBAL LAUNCH COMPLETE';
  } else if (inspectedIndex !== null && inspectedIndex !== nextUpcomingIdx) {
    dom.phaseBadge.textContent = currentLaunched
      ? 'VIEWING UNLOCKED REGION'
      : 'PREVIEWING UPCOMING REGION';
  } else {
    dom.phaseBadge.textContent = 'NEXT REGION TO UNLOCK';
  }

  const diffMs = Math.max(0, currentRegion.targetMs - nowMs);
  const effectiveDiff = currentLaunched ? 0 : diffMs;

  const days = Math.floor(effectiveDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((effectiveDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((effectiveDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((effectiveDiff / 1000) % 60);

  dom.cdDays.textContent = pad2(days);
  dom.cdHours.textContent = pad2(hours);
  dom.cdMinutes.textContent = pad2(minutes);
  dom.cdSeconds.textContent = pad2(seconds);

  const chips = dom.rolloutStrip.querySelectorAll('.region-chip');
  chips.forEach((chip, idx) => {
    const reg = SCHEDULE[idx];
    const launched = isRegionLaunched(reg, nowMs);
    chip.classList.toggle('is-launched', launched);
    chip.classList.toggle('is-active', idx === displayIndex);

    const statusEl = document.getElementById(`chipStatus-${reg.id}`);
    if (statusEl) {
      if (launched) {
        statusEl.textContent = 'UNLOCKED';
      } else {
        const d = Math.max(0, reg.targetMs - nowMs);
        const hTotal = Math.floor(d / (1000 * 60 * 60));
        const mRem = Math.floor((d / (1000 * 60)) % 60);
        statusEl.textContent = `IN ${hTotal}H ${pad2(mRem)}M`;
      }
    }
  });

  renderIsometricMap(nowMs, displayIndex);
}

dom.audioToggleBtn.addEventListener('click', () => {
  const playing = audioEngine.toggle();
  dom.audioToggleBtn.classList.toggle('is-playing', playing);
  dom.audioToggleBtn.setAttribute('aria-pressed', String(playing));
  dom.audioIcon.textContent = playing ? '❚❚' : '▶';
  dom.audioLabel.textContent = playing ? 'PAUSE VICE CITY AUDIO' : 'VICE CITY AUDIO (MP3/SYNTH)';
});

dom.volumeSlider.addEventListener('input', (e) => {
  audioEngine.setVolume(parseFloat(e.target.value));
});

dom.simulateLaunchBtn.addEventListener('click', () => {
  const nowMs = Date.now();
  const nextIdx = getNextUpcomingIndex(nowMs);

  if (nextIdx === -1) {
    SCHEDULE.forEach((r) => (r.simulatedLaunched = false));
    activeIndex = 0;
    inspectedIndex = null;
    updateDashboard();
    return;
  }

  SCHEDULE[nextIdx].simulatedLaunched = true;
  inspectedIndex = null;
  updateDashboard();
});

dom.fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

buildRolloutStrip();
updateDashboard();
setInterval(updateDashboard, 1000);
