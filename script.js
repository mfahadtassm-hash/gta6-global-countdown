const RELEASE_SCHEDULE = [
  {
    id: 'nz',
    regionName: 'New Zealand & Pacific Wave (Est.)',
    countryName: 'NEW ZEALAND',
    flag: '🇳🇿',
    timeZone: 'Pacific/Auckland',
    launchISO: '2026-11-19T00:00:00+13:00',
    mapCoords: { x: 922, y: 416 }
  },
  {
    id: 'au',
    regionName: 'Australia Eastern Wave (Est.)',
    countryName: 'AUSTRALIA',
    flag: '🇦🇺',
    timeZone: 'Australia/Sydney',
    launchISO: '2026-11-19T00:00:00+11:00',
    mapCoords: { x: 855, y: 368 }
  },
  {
    id: 'jp',
    regionName: 'Japan & South Korea (Est.)',
    countryName: 'JAPAN',
    flag: '🇯🇵',
    timeZone: 'Asia/Tokyo',
    launchISO: '2026-11-19T00:00:00+09:00',
    mapCoords: { x: 852, y: 162 }
  },
  {
    id: 'sg',
    regionName: 'Southeast Asia & China (Est.)',
    countryName: 'SINGAPORE / HK',
    flag: '🇸🇬',
    timeZone: 'Asia/Singapore',
    launchISO: '2026-11-19T00:00:00+08:00',
    mapCoords: { x: 765, y: 272 }
  },
  {
    id: 'in',
    regionName: 'India Standard Wave (Est.)',
    countryName: 'INDIA',
    flag: '🇮🇳',
    timeZone: 'Asia/Kolkata',
    launchISO: '2026-11-19T00:00:00+05:30',
    mapCoords: { x: 695, y: 222 }
  },
  {
    id: 'pk',
    regionName: 'Pakistan & Central Asia (Est.)',
    countryName: 'PAKISTAN',
    flag: '🇵🇰',
    timeZone: 'Asia/Karachi',
    launchISO: '2026-11-19T00:00:00+05:00',
    mapCoords: { x: 665, y: 196 }
  },
  {
    id: 'ae',
    regionName: 'UAE & Gulf Region (Est.)',
    countryName: 'UNITED ARAB EMIRATES',
    flag: '🇦🇪',
    timeZone: 'Asia/Dubai',
    launchISO: '2026-11-19T00:00:00+04:00',
    mapCoords: { x: 618, y: 214 }
  },
  {
    id: 'eu',
    regionName: 'Central Europe Wave (Est.)',
    countryName: 'GERMANY / FRANCE',
    flag: '🇪🇺',
    timeZone: 'Europe/Berlin',
    launchISO: '2026-11-19T00:00:00+01:00',
    mapCoords: { x: 505, y: 126 }
  },
  {
    id: 'uk',
    regionName: 'United Kingdom & Ireland (Est.)',
    countryName: 'UNITED KINGDOM',
    flag: '🇬🇧',
    timeZone: 'Europe/London',
    launchISO: '2026-11-19T00:00:00+00:00',
    mapCoords: { x: 465, y: 118 }
  },
  {
    id: 'br',
    regionName: 'Brazil & South America (Est.)',
    countryName: 'BRAZIL',
    flag: '🇧🇷',
    timeZone: 'America/Sao_Paulo',
    launchISO: '2026-11-19T00:00:00-03:00',
    mapCoords: { x: 302, y: 348 }
  },
  {
    id: 'us-east',
    regionName: 'Leonida / Vice City & US East (Est.)',
    countryName: 'USA — EAST COAST',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
    launchISO: '2026-11-19T00:00:00-05:00',
    mapCoords: { x: 242, y: 185 }
  },
  {
    id: 'us-west',
    regionName: 'US West Coast & Pacific (Est.)',
    countryName: 'USA — WEST COAST',
    flag: '🇺🇸',
    timeZone: 'America/Los_Angeles',
    launchISO: '2026-11-19T00:00:00-08:00',
    mapCoords: { x: 145, y: 162 }
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
  mapMarkersLayer: document.getElementById('mapMarkersLayer'),
  sequenceTrack: document.getElementById('sequenceTrack'),
  sequenceActiveLine: document.getElementById('sequenceActiveLine'),
  calloutFlag: document.getElementById('calloutFlag'),
  calloutName: document.getElementById('calloutName'),
  calloutMiniTimer: document.getElementById('calloutMiniTimer'),
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
  fullscreenBtn: document.getElementById('fullscreenBtn')
};

class LeonidaAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.stepTimer = null;
    this.stepIndex = 0;
    this.volume = 0.45;
    this.restorePreference();
  }

  restorePreference() {
    try {
      const savedVol = localStorage.getItem('leonida_audio_vol');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
        dom.volumeSlider.value = this.volume;
      }
    } catch (_) {}
  }

  savePreference() {
    try {
      localStorage.setItem('leonida_audio_vol', String(this.volume));
    } catch (_) {}
  }

  initContext() {
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

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.04);
    }
    this.savePreference();
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isPlaying;
  }

  startMusic() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.stepIndex = 0;

    const bassProgression = [
      110.0, 110.0, 110.0, 110.0,
      87.31, 87.31, 87.31, 87.31,
      65.41, 65.41, 65.41, 65.41,
      98.00, 98.00, 98.00, 98.00
    ];

    const padChords = [
      [220.0, 261.63, 329.63, 493.88],
      [174.61, 220.0, 261.63, 329.63],
      [130.81, 196.0, 246.94, 329.63],
      [196.0, 246.94, 293.66, 392.0]
    ];

    this.stepTimer = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const barStep = this.stepIndex % 16;
      const chordIdx = Math.floor((this.stepIndex % 64) / 16);

      const bassFreq = bassProgression[chordIdx * 4 + (barStep % 4)];
      this.triggerSynthNote(bassFreq, 'sawtooth', 0.14, 0.14, now, 340);

      if (barStep === 0) {
        padChords[chordIdx].forEach((freq) => {
          this.triggerSynthNote(freq, 'triangle', 0.045, 2.2, now, 950);
        });
      }

      if (barStep % 4 === 2) {
        const arpNotes = padChords[chordIdx];
        const note = arpNotes[(this.stepIndex / 2) % arpNotes.length] * 2;
        this.triggerSynthNote(note, 'sine', 0.035, 0.35, now, 1600);
      }

      this.stepIndex++;
    }, 145);
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  triggerSynthNote(freq, type, peakGain, duration, startTime, filterCutoff) {
    if (!this.ctx || !this.masterGain) return;
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
  }

  playLaunchFanfare() {
    try {
      this.initContext();
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.09;
        this.triggerSynthNote(freq, 'triangle', 0.16, 1.1, t, 2400);
        this.triggerSynthNote(freq * 0.5, 'sine', 0.12, 1.3, t, 1200);
      });
    } catch (_) {}
  }
}

const audioEngine = new LeonidaAudioEngine();

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

function renderWorldMap(nowMs, focusIndex) {
  const points = SCHEDULE.map((r) => `${r.mapCoords.x},${r.mapCoords.y}`);
  dom.sequenceTrack.setAttribute('d', `M ${points.join(' L ')}`);

  const activeSlice = SCHEDULE.slice(0, Math.max(1, focusIndex + 1)).map(
    (r) => `${r.mapCoords.x},${r.mapCoords.y}`
  );
  dom.sequenceActiveLine.setAttribute('d', `M ${activeSlice.join(' L ')}`);

  dom.mapMarkersLayer.innerHTML = '';
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
      pulse.setAttribute('r', '10');
      pulse.setAttribute('class', 'marker-pulse-ring');
      g.appendChild(pulse);
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', isFocus ? '6.5' : launched ? '4.5' : '4');

    if (isFocus) {
      dot.setAttribute('fill', '#ff9e3b');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2');
      dot.setAttribute('filter', 'url(#neonGlow)');
    } else if (launched) {
      dot.setAttribute('fill', '#10b981');
      dot.setAttribute('stroke', '#064e3b');
      dot.setAttribute('stroke-width', '1.2');
    } else {
      dot.setAttribute('fill', '#ff2e93');
      dot.setAttribute('stroke', '#1e1136');
      dot.setAttribute('stroke-width', '1.2');
    }

    g.appendChild(dot);
    dom.mapMarkersLayer.appendChild(g);
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
  audioEngine.playLaunchFanfare();

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

  dom.calloutFlag.textContent = currentRegion.flag;
  dom.calloutName.textContent = currentRegion.countryName;
  dom.calloutMiniTimer.textContent = currentLaunched
    ? 'LIVE NOW'
    : `${pad2(days)}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;

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

  renderWorldMap(nowMs, displayIndex);
}

dom.audioToggleBtn.addEventListener('click', () => {
  const playing = audioEngine.toggle();
  dom.audioToggleBtn.classList.toggle('is-playing', playing);
  dom.audioToggleBtn.setAttribute('aria-pressed', String(playing));
  dom.audioIcon.textContent = playing ? '❚❚' : '▶';
  dom.audioLabel.textContent = playing ? 'PAUSE SYNTH' : 'LEONIDA SYNTH';
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
