// app.js - Presentation Controller, Audio Engine & Game Handler
class AppController {
  constructor() {
    this.currentSlideIndex = 0;
    this.totalSlides = 15;

    // 45-Minute Master Presentation Timer (2700 seconds)
    this.totalTimerSeconds = 45 * 60;
    this.remainingSeconds = this.totalTimerSeconds;
    this.timerInterval = null;
    this.isTimerRunning = false;

    // Web Audio Synthesizer
    this.audioEnabled = true;
    this.audioCtx = null;

    // Section Milestone Allocations (Minutes)
    this.sections = [
      { id: 'sec1', title: '1. Introduction: Why Innovation Needs Transformation', durationMin: 5, slides: [0, 1] },
      { id: 'sec2', title: '2. From Idea to Opportunity', durationMin: 7, slides: [2, 3, 4] },
      { id: 'sec3', title: '3. AI Technologies as Innovation Accelerators', durationMin: 8, slides: [5, 6, 7] },
      { id: 'sec4', title: '4. From Prototype to Business Transformation', durationMin: 8, slides: [8, 9, 10] },
      { id: 'sec5', title: '5. Innovation Leadership and Future Skills', durationMin: 7, slides: [11, 12] },
      { id: 'sec6', title: '6. Responsible AI and Conclusion', durationMin: 5, slides: [13] },
      { id: 'sec7', title: '7. Audience Q&A and Reflection', durationMin: 5, slides: [14] }
    ];

    // Leadership Game State
    this.leadershipState = {
      trustScore: 70,
      velocityScore: 70,
      governanceScore: 70,
      decisionsMade: 0
    };
  }

  init() {
    this.renderCitations();
    this.initTimer();
    this.updateSlideView();
    this.setupKeyboardNav();
    console.log('AppController initialized successfully.');
  }

  // --- AUDIO SYNTHESIZER ---
  playAudio(type = 'click') {
    if (!this.audioEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.log('Audio playback prevented or unsupported:', e);
    }
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) btn.innerHTML = this.audioEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
  }

  // --- TIMER LOGIC ---
  initTimer() {
    this.updateTimerDisplay();
  }

  toggleTimer() {
    this.playAudio('click');
    if (this.isTimerRunning) {
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      document.getElementById('timer-play-btn').innerHTML = '▶ Start Timer';
    } else {
      this.isTimerRunning = true;
      document.getElementById('timer-play-btn').innerHTML = '⏸ Pause Timer';
      this.timerInterval = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.isTimerRunning = false;
          alert('⏰ 45-Minute Presentation Time is Complete!');
        }
      }, 1000);
    }
  }

  resetTimer() {
    this.playAudio('click');
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.remainingSeconds = this.totalTimerSeconds;
    document.getElementById('timer-play-btn').innerHTML = '▶ Start Timer';
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const timerElem = document.getElementById('master-timer-display');
    if (timerElem) timerElem.innerText = formatted;

    const elapsedPercent = ((this.totalTimerSeconds - this.remainingSeconds) / this.totalTimerSeconds) * 100;
    const bar = document.getElementById('timer-progress-fill');
    if (bar) bar.style.width = `${elapsedPercent}%`;
  }

  // --- SLIDE NAVIGATION ---
  nextSlide() {
    if (this.currentSlideIndex < this.totalSlides - 1) {
      this.currentSlideIndex++;
      this.updateSlideView();
      this.playAudio('click');
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.updateSlideView();
      this.playAudio('click');
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlideIndex = index;
      this.updateSlideView();
      this.playAudio('click');
    }
  }

  updateSlideView() {
    const slides = document.querySelectorAll('.slide-card');
    slides.forEach((slide, idx) => {
      if (idx === this.currentSlideIndex) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });

    const slideNumElem = document.getElementById('slide-counter-display');
    if (slideNumElem) slideNumElem.innerText = `Slide ${this.currentSlideIndex + 1} of ${this.totalSlides}`;

    const currentSection = this.sections.find(s => s.slides.includes(this.currentSlideIndex));
    if (currentSection) {
      const secTag = document.getElementById('current-section-badge');
      if (secTag) secTag.innerText = currentSection.title;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft') {
        this.prevSlide();
      }
    });
  }

  // --- CITATION DRAWER ---
  toggleCitations() {
    this.playAudio('click');
    const drawer = document.getElementById('citation-drawer');
    if (drawer) drawer.classList.toggle('open');
  }

  renderCitations() {
    const listElem = document.getElementById('citation-list-container');
    if (!listElem) return;
    const citations = window.InnovationApi.getCitations();
    listElem.innerHTML = citations.map(c => `
      <div class="citation-card">
        <div class="citation-title">📖 ${c.title} (${c.year})</div>
        <div class="citation-author"><strong>Source:</strong> ${c.author}</div>
        <div class="citation-summary">${c.summary}</div>
        <a href="${c.url}" target="_blank" rel="noopener" class="citation-link">🌐 Visit Source Link ↗</a>
      </div>
    `).join('');
  }

  // --- GAME 1: AUDIENCE POLL HANDLER ---
  handlePollVote(optionKey) {
    this.playAudio('success');
    const results = window.InnovationApi.submitPollVote(optionKey);
    this.updatePollUI(results);
  }

  updatePollUI(results) {
    for (const key in results.percentages) {
      const fill = document.getElementById(`poll-fill-${key}`);
      const pctLabel = document.getElementById(`poll-pct-${key}`);
      if (fill) fill.style.width = `${results.percentages[key]}%`;
      if (pctLabel) pctLabel.innerText = `${results.percentages[key]}%`;
    }
    const totalElem = document.getElementById('poll-total-votes');
    if (totalElem) totalElem.innerText = `${results.totalVotes} total votes recorded`;
  }

  // --- GAME 2: LIVE AI DEMO GENERATOR HANDLER ---
  async handleGenerateAIMVP() {
    const input = document.getElementById('ai-problem-input');
    const domainSelect = document.getElementById('ai-domain-select');
    const outputContainer = document.getElementById('ai-demo-output');

    if (!input || !input.value.trim()) {
      alert('Please enter a business problem to test the AI Innovation Generator!');
      return;
    }

    this.playAudio('click');
    outputContainer.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>⚡ Generating AI Solution Concept & MVP Scope...</p>
      </div>
    `;

    const result = await window.InnovationAI.generateMVPHypothesis(input.value.trim(), domainSelect.value);
    this.playAudio('success');

    outputContainer.innerHTML = `
      <div class="mvp-result-card">
        <div class="mvp-header">
          <span class="mvp-tag">🚀 AI Innovation Strategy Proposal</span>
          <span class="mvp-risk">Risk Profile: ${result.riskScore}</span>
        </div>

        <div class="mvp-section">
          <h4>💡 Opportunity Statement</h4>
          <p>${result.opportunityStatement}</p>
        </div>

        <div class="mvp-section">
          <h4>⚙️ Proposed AI Technology</h4>
          <p class="highlight-box">${result.aiSolutionConcept}</p>
        </div>

        <div class="mvp-section">
          <h4>🧪 Testable MVP Hypothesis</h4>
          <p class="hypothesis-quote">"${result.mvpHypothesis}"</p>
        </div>

        <div class="mvp-grid">
          <div class="mvp-subcard">
            <h4>📊 Primary Business KPIs</h4>
            <ul>${result.keyMetrics.map(m => `<li>✅ ${m}</li>`).join('')}</ul>
          </div>
          <div class="mvp-subcard">
            <h4>🔍 Missing Evidence Checklist</h4>
            <ul>${result.missingEvidenceChecklist.map(c => `<li>❓ ${c}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    `;
  }

  // --- GAME 3: LEADERSHIP DECISION SCENARIO GAME HANDLER ---
  makeLeadershipChoice(choiceType) {
    this.playAudio('click');
    this.leadershipState.decisionsMade++;

    if (choiceType === 'opt_force_speed') {
      this.leadershipState.velocityScore = Math.min(100, this.leadershipState.velocityScore + 20);
      this.leadershipState.trustScore = Math.max(0, this.leadershipState.trustScore - 25);
      this.leadershipState.governanceScore = Math.max(0, this.leadershipState.governanceScore - 15);
    } else if (choiceType === 'opt_co_create') {
      this.leadershipState.trustScore = Math.min(100, this.leadershipState.trustScore + 25);
      this.leadershipState.governanceScore = Math.min(100, this.leadershipState.governanceScore + 20);
      this.leadershipState.velocityScore = Math.min(100, this.leadershipState.velocityScore + 10);
      this.playAudio('win');
    } else if (choiceType === 'opt_ban_ai') {
      this.leadershipState.governanceScore = Math.min(100, this.leadershipState.governanceScore + 15);
      this.leadershipState.velocityScore = Math.max(0, this.leadershipState.velocityScore - 30);
      this.leadershipState.trustScore = Math.max(0, this.leadershipState.trustScore - 10);
    }

    this.updateLeadershipGameUI(choiceType);
  }

  updateLeadershipGameUI(lastChoice) {
    const tMeter = document.getElementById('meter-trust');
    const vMeter = document.getElementById('meter-velocity');
    const gMeter = document.getElementById('meter-governance');

    if (tMeter) { tMeter.style.width = `${this.leadershipState.trustScore}%`; tMeter.innerText = `${this.leadershipState.trustScore}%`; }
    if (vMeter) { vMeter.style.width = `${this.leadershipState.velocityScore}%`; vMeter.innerText = `${this.leadershipState.velocityScore}%`; }
    if (gMeter) { gMeter.style.width = `${this.leadershipState.governanceScore}%`; gMeter.innerText = `${this.leadershipState.governanceScore}%`; }

    const feedbackBox = document.getElementById('leadership-feedback-box');
    if (feedbackBox) {
      if (lastChoice === 'opt_co_create') {
        feedbackBox.className = 'feedback-card success';
        feedbackBox.innerHTML = '🌟 <strong>EXCELLENT LEADERSHIP CHOICE!</strong> You involved employees in prompt review and established clear human oversight. Trust soared and operational quality remains high.';
      } else if (lastChoice === 'opt_force_speed') {
        feedbackBox.className = 'feedback-card warning';
        feedbackBox.innerHTML = '⚠️ <strong>SPEED SURGE, TRUST CRASH!</strong> Pushing AI adoption without training created anxiety and unverified hallucinations in output.';
      } else {
        feedbackBox.className = 'feedback-card danger';
        feedbackBox.innerHTML = '🛑 <strong>STAGNATION RISK!</strong> Restricting AI tools caused teams to fall behind competitors while shadow AI usage increased under the radar.';
      }
    }
  }

  // --- GAME 4: ETHICS AUDIT SCANNER HANDLER ---
  async handleRunEthicsScan() {
    const toolName = document.getElementById('ethics-tool-name').value || 'Generative Support Bot';
    const hasHumanReview = document.getElementById('ethics-chk-human').checked;
    const hasDiverseDataset = document.getElementById('ethics-chk-bias').checked;
    const isEnterprisePrivate = document.getElementById('ethics-chk-privacy').checked;
    const hasGuardrails = document.getElementById('ethics-chk-sec').checked;
    const hasAuditLogging = document.getElementById('ethics-chk-gov').checked;

    const outputElem = document.getElementById('ethics-audit-results');
    this.playAudio('click');

    outputElem.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p>🔍 Diagnostic Scanning AI Model against OECD & IEEE Ethics Guidelines...</p>
      </div>
    `;

    const result = await window.AIRiskScanner.runAuditScan(toolName, {
      hasHumanReview, hasDiverseDataset, isEnterprisePrivate, hasGuardrails, hasAuditLogging
    });

    this.playAudio(result.status === 'PASS' ? 'win' : 'click');

    outputElem.innerHTML = `
      <div class="audit-result-card ${result.status.toLowerCase()}">
        <div class="audit-header">
          <h3>${result.statusBadge}</h3>
          <div class="audit-score-circle">Overall Rating: ${result.overallScore} / 100</div>
        </div>

        <div class="audit-scores-grid">
          <div class="score-item">Fact Reliability: <strong>${result.scores.reliability}%</strong></div>
          <div class="score-item">Bias Mitigation: <strong>${result.scores.bias}%</strong></div>
          <div class="score-item">Privacy Protection: <strong>${result.scores.privacy}%</strong></div>
          <div class="score-item">Cybersecurity: <strong>${result.scores.security}%</strong></div>
          <div class="score-item">Governance: <strong>${result.scores.governance}%</strong></div>
        </div>

        ${result.recommendations.length > 0 ? `
          <div class="audit-recs">
            <h4>📋 Mandatory Remediation Steps:</h4>
            <ul>${result.recommendations.map(r => `<li>⚠️ ${r}</li>`).join('')}</ul>
          </div>
        ` : `<div class="audit-recs success">✅ All Responsible AI benchmarks fully satisfied!</div>`}
      </div>
    `;
  }

  // --- IN-SITE HTML5 VIDEO PLAYER MODAL ---
  openVideoModal(videoKey) {
    this.playAudio('click');
    const modal = document.getElementById('video-modal');
    const videoElem = document.getElementById('modal-html5-player');

    // Reliable Google Open-Source Sample Videos (100% guarantee play without YouTube Error 153)
    const videoSources = {
      'transform': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'genai': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'supply': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'jobs': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'ethics': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4'
    };

    const src = videoSources[videoKey] || videoSources['transform'];

    if (modal && videoElem) {
      videoElem.src = src;
      videoElem.load();
      videoElem.play().catch(e => console.log('Autoplay prevented by browser:', e));
      modal.style.display = 'flex';
    }
  }

  closeVideoModal() {
    this.playAudio('click');
    const modal = document.getElementById('video-modal');
    const videoElem = document.getElementById('modal-html5-player');
    if (modal && videoElem) {
      videoElem.pause();
      videoElem.src = '';
      modal.style.display = 'none';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.App = new AppController();
  window.App.init();
});
