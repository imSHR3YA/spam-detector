/**
 * app.js - Email Spam Detector Frontend Logic
 * ============================================
 * Handles:
 *  - Health check on page load
 *  - Sending email text to /predict API
 *  - Displaying results with animations
 *  - Example loading, input validation, error handling
 */

// ── Sample Texts ───────────────────────────────────────────────────────────
const EXAMPLES = {
  spam: `Congratulations! You've been SELECTED as our lucky winner! 🎉
You have won a FREE iPhone 15 Pro worth $1,199!
To claim your prize, click the link below IMMEDIATELY.
This offer expires in 24 hours. Don't miss out!
➡ http://claim-your-prize-now.xyz/?ref=lucky123
Act NOW before someone else takes your spot!`,

  ham: `Hi Sarah,

Following up on our meeting from yesterday regarding the Q4 marketing plan.
I've attached the revised budget spreadsheet with the changes we discussed.

Could you review section 3 on digital campaigns and let me know if the 
allocation looks right? I'd like to finalize everything before Thursday's 
presentation to the board.

Let me know if you have any questions.

Best regards,
James`
};

// ── DOM References ─────────────────────────────────────────────────────────
const emailInput    = document.getElementById('emailInput');
const charCount     = document.getElementById('charCount');
const analyzeBtn    = document.getElementById('analyzeBtn');
const btnLoader     = document.getElementById('btnLoader');
const resultSection = document.getElementById('resultSection');
const resultCard    = document.getElementById('resultCard');
const healthBadge   = document.getElementById('healthBadge');
const healthText    = document.getElementById('healthText');

// ── Char Counter ───────────────────────────────────────────────────────────
emailInput.addEventListener('input', () => {
  const len = emailInput.value.length;
  charCount.textContent = `${len} char${len !== 1 ? 's' : ''}`;
});

// ── Health Check ───────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res  = await fetch('/health');
    const data = await res.json();
    if (data.status === 'ok' && data.model_loaded) {
      healthBadge.classList.add('online');
      healthText.textContent = 'API Online';
    } else {
      throw new Error('Model not loaded');
    }
  } catch {
    healthBadge.classList.add('offline');
    healthText.textContent = 'API Offline';
  }
}

// ── Load Example ───────────────────────────────────────────────────────────
function loadExample(type) {
  emailInput.value = EXAMPLES[type];
  charCount.textContent = `${emailInput.value.length} chars`;
  emailInput.focus();
}

// ── Clear ──────────────────────────────────────────────────────────────────
function clearAll() {
  emailInput.value = '';
  charCount.textContent = '0 chars';
  resultSection.style.display = 'none';
  resultCard.className = 'result-card';
  emailInput.focus();
}

// ── Show Error Toast ───────────────────────────────────────────────────────
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `⚠ ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ── Set Loading State ──────────────────────────────────────────────────────
function setLoading(loading) {
  analyzeBtn.disabled = loading;
  document.querySelector('.btn-icon').style.display = loading ? 'none' : 'inline';
  document.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
  btnLoader.style.display = loading ? 'inline-flex' : 'none';
}

// ── Display Result ─────────────────────────────────────────────────────────
function displayResult(data) {
  const isSpam = data.is_spam;
  const pct    = Math.round(data.confidence * 100);

  // Card class
  resultCard.className = `result-card ${isSpam ? 'is-spam' : 'is-ham'}`;

  // Icon
  document.getElementById('resultIcon').textContent = isSpam ? '🚨' : '✅';

  // Label + Verdict
  document.getElementById('resultLabel').textContent = 'CLASSIFICATION RESULT';
  document.getElementById('resultVerdict').textContent = isSpam
    ? '⚠ SPAM DETECTED'
    : '✓ LEGITIMATE EMAIL (Ham)';

  // Confidence
  document.getElementById('confidencePct').textContent = `${pct}%`;

  // Animate bar after paint
  const fill = document.getElementById('confidenceFill');
  fill.style.width = '0%';
  setTimeout(() => { fill.style.width = `${pct}%`; }, 60);

  // Preview
  const preview = data.processed_text_preview || '';
  if (preview) {
    document.getElementById('previewText').textContent = preview + '…';
    document.getElementById('previewArea').style.display = 'block';
  } else {
    document.getElementById('previewArea').style.display = 'none';
  }

  // Show section
  resultSection.style.display = 'block';

  // Smooth scroll to result on mobile
  if (window.innerWidth <= 600) {
    setTimeout(() => resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}

// ── Main Analyze Function ──────────────────────────────────────────────────
async function analyzeEmail() {
  const text = emailInput.value.trim();

  // Client-side validation
  if (!text) {
    showToast('Please enter an email to analyze.');
    emailInput.focus();
    return;
  }

  if (text.length < 5) {
    showToast('Email text is too short. Please enter more content.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: text })
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Server error. Please try again.');
      return;
    }

    displayResult(data);

  } catch (err) {
    console.error('API error:', err);
    showToast('Could not reach the server. Is Flask running?');
  } finally {
    setLoading(false);
  }
}

// ── Keyboard Shortcut: Ctrl+Enter ─────────────────────────────────────────
emailInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    analyzeEmail();
  }
});

// ── Init ───────────────────────────────────────────────────────────────────
checkHealth();
