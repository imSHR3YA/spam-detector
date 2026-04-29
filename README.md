# 📧 Email Spam Detector v2.0

A complete machine learning web application that classifies emails as **Spam** or **Ham (Legitimate)** using TF-IDF feature extraction and Logistic Regression. Now with advanced features including batch analysis, dark mode, PDF exports, and optional LLaMA LLM integration for low-confidence escalations.

---

## 🎯 New Features (v2.0)

### ✨ 8 Advanced Features Added

1. **🔴 Word Heatmap** — Visualize which words triggered spam detection with color-coded signals (red/amber/green)
2. **📋 History Log** — Last 5 analyzed emails with timestamps and quick-access recall
3. **📦 Batch CSV Upload** — Analyze 100s of emails at once from CSV files
4. **📊 Live Stats Counter** — Real-time counters for total scanned, spam caught, ham passed, and spam rate %
5. **🌙 Dark/Light Mode Toggle** — Save theme preference in localStorage, smooth 0.3s transitions
6. **📄 PDF Report Export** — Download detailed analysis reports with verdict, confidence, and top trigger words
7. **⏱️ Analysis Speed Timer** — Shows milliseconds for each analysis (e.g., "Analyzed in 145ms")
8. **🧠 Ollama Hybrid LLM Fallback** — Automatic escalation to local LLaMA when Logistic Regression confidence < 75%

---

## 🗂 Project Structure

```
spam_detector/
├── data/
│   ├── emails.csv              ← Labeled dataset (spam/ham)
│   └── generate_dataset.py     ← Script to regenerate the dataset
│
├── model/
│   ├── spam_model.pkl          ← Trained Logistic Regression model
│   └── tfidf_vectorizer.pkl    ← Fitted TF-IDF vectorizer
│
├── templates/
│   └── index.html              ← Frontend HTML with all new features
│
├── static/
│   ├── css/style.css           ← Styles (dark mode + heatmap + new components)
│   └── js/app.js               ← Frontend JS (all 8 features implemented)
│
├── preprocessing.py            ← Text cleaning module (unchanged)
├── train_model.py              ← ML training pipeline (unchanged)
├── app.py                      ← Flask backend (batch endpoint + Ollama integration)
├── requirements.txt            ← Add ollama dependency
└── README.md
```

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (HTML/CSS/JS)                   │
│  ┌────────────────┬──────────────┬──────────────┬────────────┐  │
│  │ Single Email   │ Batch Upload │ History Log  │ Stats      │  │
│  │ + Heatmap      │ + CSV Table  │ (Last 5)     │ Counter    │  │
│  │ + Timer        │ + Results    │              │            │  │
│  │ + PDF Export   │ + Download   │              │            │  │
│  │ + Dark Mode    │              │              │            │  │
│  └────────────────┴──────────────┴──────────────┴────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                      fetch('/predict')
                      fetch('/predict_batch')
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    Flask Backend (Python)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ /predict (Single Email)                                  │   │
│  │  1. Validate input                                       │   │
│  │  2. Preprocess text (lowercase, remove stopwords, etc)   │   │
│  │  3. TF-IDF vectorize                                     │   │
│  │  4. Logistic Regression predict                          │   │
│  │  5. Calculate word scores → annotated HTML heatmap       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ IF confidence >= 0.75:                          │    │   │
│  │  │   → Return LR result (fast path)                │    │   │
│  │  │ ELSE:                                           │    │   │
│  │  │   → Call Ollama LLaMA (slow path)               │    │   │
│  │  │   → Return LLaMA result + reasoning             │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ /predict_batch (CSV Upload)                              │   │
│  │  1. Accept multipart CSV file                            │   │
│  │  2. Parse CSV (column: "text" or "email")                │   │
│  │  3. Loop: preprocess → vectorize → predict each row      │   │
│  │  4. Return JSON array of results + summary stats         │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
         │                               │
         │                               │
    TF-IDF             Logistic Regression    (Optional: Ollama LLaMA)
  Vectorizer           Model (spam_model.pkl)  (local LLM fallback)
```

---

## ⚡ How to Run Locally

### Prerequisites
- Python 3.8+
- pip
- (Optional for Ollama feature) Ollama installed and running locally

### 1. Clone / Download the project
```bash
git clone https://github.com/imSHR3YA/spam-detector
cd spam-detector
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

**Updated `requirements.txt`:**
```
Flask==3.0.3
scikit-learn==1.5.0
pandas==2.2.2
numpy==1.26.4
ollama==0.0.11          # New: for Ollama hybrid LLM feature (optional)
```

### 4. Train the model
```bash
python train_model.py
```
This generates `model/spam_model.pkl` and `model/tfidf_vectorizer.pkl`.

### 5. (Optional) Install and run Ollama
For the hybrid LLM fallback feature:

```bash
# Download Ollama from https://ollama.ai/download
# Then pull the model:
ollama pull llama3.2

# Run Ollama server in background (it listens on localhost:11434)
ollama serve
```

If Ollama is not installed or running, the app gracefully falls back to Logistic Regression only.

### 6. Run the Flask server
```bash
python app.py
```

Server starts at `http://localhost:5001`

### 7. Open in browser
```
http://localhost:5001
```

---

## 🔌 API Endpoints

### GET /health
Check server and model status.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "vectorizer_loaded": true,
  "service": "Email Spam Detector API",
  "version": "2.0.0",
  "ollama_available": false
}
```

---

### POST /predict
Classify a single email as spam or ham.

**Request:**
```json
{
  "email": "Congratulations! You've won $1,000,000. Click here to claim!"
}
```

**Response (Fast Path — LR confidence >= 0.75):**
```json
{
  "prediction": "spam",
  "confidence": 0.9987,
  "confidence_pct": "99.9%",
  "is_spam": true,
  "message": "⚠️ This email appears to be SPAM.",
  "processed_text_preview": "congratulations won click claim",
  "word_scores": {
    "congratulations": 0.45,
    "won": 0.38,
    "click": 0.52,
    "claim": 0.41
  },
  "annotated_html": "<mark class=\"hl-high\">congratulations</mark> <mark class=\"hl-medium\">won</mark> ...",
  "top_words": ["click", "claim", "won", "congratulations"],
  "p_spam": 0.9987,
  "p_ham": 0.0013,
  "model_used": "logistic_regression",
  "reasoning": null
}
```

**Response (Slow Path — LR confidence < 0.75, escalated to LLaMA):**
```json
{
  "prediction": "spam",
  "confidence": 0.87,
  "confidence_pct": "87%",
  "is_spam": true,
  "message": "⚠️ This email appears to be SPAM.",
  "processed_text_preview": "...",
  "word_scores": { ... },
  "annotated_html": "...",
  "top_words": [...],
  "p_spam": 0.87,
  "p_ham": 0.13,
  "model_used": "llama3.2",
  "reasoning": "The email uses aggressive urgency tactics and promises unrealistic rewards, which are classic spam markers."
}
```

---

### POST /predict_batch
Batch analyze emails from a CSV file.

**Request (multipart/form-data):**
```
POST /predict_batch
Content-Type: multipart/form-data

file: (CSV file)
```

**CSV Format:**
```csv
text,other_column
"Congratulations! Click here!",value1
"Hi Sarah, following up on our meeting...",value2
```

Or use column name `email` instead of `text`.

**Response:**
```json
{
  "results": [
    {
      "email_preview": "Congratulations! Click here!",
      "prediction": "spam",
      "confidence": 0.9987,
      "is_spam": true
    },
    {
      "email_preview": "Hi Sarah, following up on our meeting...",
      "prediction": "ham",
      "confidence": 0.9856,
      "is_spam": false
    }
  ],
  "total": 2,
  "spam_count": 1,
  "ham_count": 1,
  "spam_rate": 50.0
}
```

---

## 📊 Frontend Features in Detail

### 1️⃣ Word Heatmap 🔴
After analysis, the result card displays the original email text with words highlighted by spam signal strength:

- **🔴 Red background** — Strong spam signal (high positive coefficient)
- **🟡 Amber background** — Moderate spam signal
- **🟢 Green background** — Ham signal (negative coefficient)

This gives users immediate visual feedback on which words "triggered" the detection.

**Implementation:**
- Backend calculates `word_scores` using Logistic Regression coefficients
- Backend generates `annotated_html` with `<mark class="hl-high/medium/safe">` tags
- Frontend renders as innerHTML in `.heatmap-content`
- CSS colors styled in dark/light mode

---

### 2️⃣ History Log 📋
Below the main analysis card, a history section displays the last 5 analyzed emails.

**Each history item shows:**
- First 60 characters of email (truncated with "...")
- SPAM or HAM badge with confidence %
- Relative timestamp ("just now", "2m ago", "1h ago")

**Click any history item** → repopulates textarea with that email for quick re-analysis.

**Implementation:**
- JavaScript `history[]` array (session-only, resets on page refresh)
- `addToHistory()` stores item with `Date.now()` timestamp
- `getTimeAgo()` formats relative time
- `loadFromHistory()` restores email text on click

---

### 3️⃣ Batch CSV Upload 📦
A dedicated "Batch CSV" tab lets users analyze 100s of emails at once.

**Workflow:**
1. User selects a `.csv` file (column must be named "text" or "email")
2. Clicks "Scan All"
3. Server processes each row through preprocessing → TF-IDF → model
4. Returns results table with email preview, verdict, confidence
5. User can "Download Results CSV" to save findings

**Results Table Columns:**
- Email Preview (60 chars)
- Verdict (SPAM / HAM badge)
- Confidence (%)

**Summary:**
```
✅ Scanned 150 emails — ⚠️ 47 spam, ✓ 103 ham (31.3% spam rate)
```

---

### 4️⃣ Live Stats Counter 📊
Four counters at the top of the page, updated in real-time:

- **Total Scanned** — Cumulative count of all analyses (single + batch)
- **Spam Caught** — Count of emails predicted as spam
- **Ham Passed** — Count of emails predicted as ham
- **Spam Rate %** — (Spam Caught / Total Scanned) × 100

**Animations:**
- Numbers count up smoothly when values change (20ms per step)
- Persists for the session (resets on page refresh)

---

### 5️⃣ Dark / Light Mode Toggle 🌙
Header button with sun ☀️ / moon 🌙 icon.

**Features:**
- Smooth 0.3s CSS transition between themes
- **Light mode:** Bright whites, dark text (default)
- **Dark mode:** `#0d0d0d` background, light text
- Theme preference **saved in localStorage** → persists across sessions
- Applied before page render → **no flash of wrong theme**

**CSS Variable Switching:**
```css
:root { --bg: #ffffff; --text: #1a1a2e; /* light */ }
html.dark-mode { --bg: #0a0a0f; --text: #e8e8f0; /* dark */ }
```

---

### 6️⃣ PDF Report Export 📄
"Export PDF Report" button in result section (using **jsPDF library**).

**PDF Contains:**
- Header: "The Spam Examiner — Analysis Report"
- Generated date/time
- Full email content
- **Verdict** in large, colored text (red for SPAM, green for HAM)
- Confidence score
- Top 5 trigger words with coefficients
- Model used (Logistic Regression or LLaMA)
- (If applicable) AI reasoning from LLaMA

**Implementation:**
```javascript
const { jsPDF } = window;  // From CDN
const doc = new jsPDF();
doc.text("The Spam Examiner", 15, 15);
doc.text(`Verdict: ${verdict}`, 15, 40);
// ... more content
doc.save(`spam_analysis_${Date.now()}.pdf`);
```

---

### 7️⃣ Analysis Speed Timer ⏱️
After each analysis, a subtle timer displays:
```
⏱️ Analyzed in 145ms
```

**Measurement:**
- `performance.now()` before fetch
- `performance.now()` after result renders
- Difference = total round-trip time (network + backend processing)

**Why useful?** Users see response time immediately and can estimate batch processing duration.

---

### 8️⃣ Ollama Hybrid LLM Fallback 🧠

#### Architecture

**Logistic Regression** is fast (~5ms) but sometimes uncertain. For edge cases:

1. **Prediction Step:** Use LR on all emails
2. **Confidence Check:**
   - If LR confidence **≥ 0.75** → return immediately (fast path) ✅
   - If LR confidence **< 0.75** → escalate to Ollama LLaMA (slow path) 🧠

#### Backend Logic (app.py)

```python
# Step 1: Get LR prediction
prediction = model.predict(text_vector)[0]
probabilities = model.predict_proba(text_vector)[0]
confidence = float(probabilities[prediction])
label = "spam" if prediction == 1 else "ham"
model_used = "logistic_regression"
reasoning = None

# Step 2: Check if we should escalate
if confidence < 0.75 and OLLAMA_AVAILABLE:
    ollama_result = get_ollama_prediction(email_text)
    if ollama_result:
        model_used = "llama3.2"
        label = ollama_result["prediction"]
        confidence = ollama_result["confidence"]
        reasoning = ollama_result["reasoning"]
```

#### Ollama Chat Call

```python
response = ollama.chat(
    model="llama3.2",
    messages=[{
        "role": "user",
        "content": f"""You are an email spam detection expert.
        Analyze this email and classify it as spam or ham.
        
        Email:
        {email_text}
        
        Reply ONLY with valid JSON:
        {{"prediction": "spam" or "ham", "confidence": 0.5-1.0, "reasoning": "one sentence"}}"""
    }]
)
```

#### Frontend Display

**Badge (in result section):**
- **⚡ Fast ML** (grey) if Logistic Regression was used
- **🧠 Deep AI (LLaMA)** (purple) if LLaMA was used

**Escalation Note** (if LLaMA was used):
```
⚡ Low confidence detected — escalated to LLaMA for deeper analysis
```

**AI Reasoning Block** (if LLaMA provided reasoning):
```
🤖 AI Reasoning: The email uses aggressive urgency tactics and promises 
                 unrealistic rewards, which are classic spam markers.
```

#### Error Handling

If Ollama is not installed or fails:
- Catch exception gracefully
- Return LR result anyway
- **Never crash** — degradation is transparent to user

```python
try:
    ollama_result = get_ollama_prediction(email_text)
except Exception as e:
    logger.warning(f"Ollama call failed: {e}")
    # Fall back to LR result (already computed)
```

---

## How the Model Works  

### Step 1 — Text Preprocessing (`preprocessing.py`)
Raw email text goes through a cleaning pipeline:
1. **Lowercase**: `"CLICK HERE"` → `"click here"`
2. **Remove URLs**: strips `http://...` links
3. **Remove email addresses**: strips `user@domain.com`
4. **Remove punctuation**: strips `!`, `$`, `.`, etc.
5. **Remove digits**: strips `1000000`, `24`, etc.
6. **Remove stopwords**: common words like `"the"`, `"is"`, `"you"` are removed
7. **Result**: only meaningful, informative words remain

**Why?** These steps reduce noise and help the model focus on words that signal spam vs ham.

### Step 2 — TF-IDF Vectorization (`TfidfVectorizer`)
- Converts cleaned text into a numerical matrix
- **TF (Term Frequency)**: How often a word appears in THIS email
- **IDF (Inverse Document Frequency)**: How rare the word is ACROSS all emails
- Words rare everywhere (IDF boost) but frequent in THIS email → high score
- `max_features=5000` keeps the top 5000 most useful words
- `ngram_range=(1,2)` captures both single words and 2-word phrases

**Example**: "free prize" as a bigram is stronger than just "free" and "prize" separately.

### Step 3 — Logistic Regression (`LogisticRegression`)
- Takes the TF-IDF feature vector as input
- Learns a weight (coefficient) for each word:
  - **High positive weight** → spam signal
  - **Low/negative weight** → ham signal
- Outputs a probability (0 to 1): `> 0.5 → spam`
- `predict_proba()` gives the confidence score
- **Coefficients are used to generate word heatmaps** in the frontend

### Step 4 — Word Score Calculation
Backend extracts coefficients for each word in the email:
```python
coef = model.coef_[0]  # weights for each feature
for idx in nonzero_indices:
    word = feature_names[idx]
    score = coef[idx]
    # Positive score → spam signal, negative → ham signal
```

These scores are then normalized to categorize words:
- **score > 0.3** → Strong spam (red highlight)
- **0.1 < score ≤ 0.3** → Moderate spam (amber highlight)
- **score < -0.1** → Ham signal (green highlight)

### Step 5 — Model Persistence (`pickle`)
- `pickle.dump()` serializes the trained model and vectorizer to `.pkl` files
- `pickle.load()` reloads them at Flask startup — no retraining needed

---

## 🌐 How the Backend Works (`app.py`)

Flask is a lightweight Python web framework.

### Single Email Flow
```
Request: POST /predict { "email": "..." }
   ↓
Input validation (empty text? too short?)
   ↓
preprocess_text(email) → clean_text
   ↓
vectorizer.transform([clean_text]) → feature_vector
   ↓
model.predict(feature_vector) → 0 (ham) or 1 (spam)
model.predict_proba() → confidence
   ↓
IF confidence >= 0.75:
  → get_word_scores() → word_scores + annotated_html
  → Return LR response (FAST PATH)
ELSE IF OLLAMA_AVAILABLE:
  → ollama.chat(...) → LLaMA prediction + reasoning
  → Return LLaMA response (SLOW PATH)
ELSE:
  → Return LR response anyway
   ↓
Return JSON response with all fields
```

### Batch CSV Flow
```
Request: POST /predict_batch (multipart CSV file)
   ↓
Validate file (is CSV?)
   ↓
Parse CSV, find "text" or "email" column
   ↓
For each row:
  → preprocess_text(email) → clean_text
  → vectorizer.transform([clean_text]) → feature_vector
  → model.predict() → prediction + confidence
  → Store result
   ↓
Aggregate stats (total, spam_count, ham_count, spam_rate)
   ↓
Return JSON { results: [...], total, spam_count, ham_count, spam_rate }
```

### Key Flask Concepts Used
- `@app.route('/predict', methods=['POST'])` — defines the endpoint
- `request.get_json()` — reads JSON body
- `request.files['file']` — reads uploaded file (batch)
- `jsonify(...)` — returns JSON response

---

## 🎨 How the Frontend Connects (`app.js`)

JavaScript `fetch()` API sends requests to Flask:

### Single Email
```javascript
const response = await fetch('/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: emailText })
});
const data = await response.json();

// data now has:
// - prediction, confidence, word_scores, annotated_html
// - p_spam, p_ham, model_used, reasoning (if Ollama)
// → displayResult(data) renders heatmap, timer, badge, reasoning
```

### Batch Upload
```javascript
const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('/predict_batch', {
  method: 'POST',
  body: formData  // multipart, not JSON
});
const data = await response.json();

// data now has:
// - results: [{ email_preview, prediction, confidence, is_spam }, ...]
// - total, spam_count, ham_count, spam_rate
// → displayBatchResults(data) renders table + summary
```

### Data Flow Diagram
```
User types email / selects CSV
    ↓
JavaScript event handler (analyzeEmail / analyzeBatch)
    ↓
Input validation (empty? too short? valid file?)
    ↓
fetch('/predict' or '/predict_batch', { ... })
    ↓
Flask receives request
    ↓
Preprocessing → TF-IDF → Model → (Optional: Ollama)
    ↓
Return JSON { prediction, confidence, word_scores, annotated_html, ... }
    ↓
JavaScript receives data
    ↓
Render result card:
  - Display verdict (SPAM / HAM)
  - Show confidence bar (animated)
  - Render heatmap (annotated_html as innerHTML)
  - Show timer (milliseconds)
  - Display model badge (LR or LLaMA)
  - Display reasoning (if Ollama)
  - Store in history
  - Update stats counters
  ↓
User sees complete analysis in ~200-500ms (LR) or ~2-5s (LLaMA)
```

---

## 📤 Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Email Spam Detector v2.0: Heatmap, Batch, History, Dark Mode, PDF Export, Ollama"

# Create repo on GitHub, then:
git remote add origin https://github.com/imSHR3YA/spam-detector
git branch -M main
git push -u origin main
```

**Add a `.gitignore`:**
```
venv/
__pycache__/
*.pyc
model/*.pkl
.env
.DS_Store
node_modules/
```

---

## 📊 Model Performance

| Metric    | Score  |
|-----------|--------|
| Accuracy  | ~100%  |
| Precision | ~100%  |
| Recall    | ~100%  |

> Note: On a small curated dataset, accuracy is very high. On real-world email data (e.g., Enron dataset, SpamAssassin), expect 95-99% accuracy depending on training set size and quality.

---

## 🔬 Possible Future Improvements

### Model & ML
- Use **Enron email dataset** (500k+ real emails) for better generalization
- Try **Naive Bayes** (`MultinomialNB`) — often faster and competitive for text classification
- Add **Random Forest** or **Gradient Boosting** for ensemble methods
- Implement **LIME** explainability to provide human-readable feature contributions

### Features
- Add **advanced filtering** (sender reputation, IP blocklist checks)
- Integrate with **real email providers** (Gmail API, Outlook API)
- Add **user feedback loop** ("This was mislabeled") for continuous retraining
- Implement **phishing detection** module
- Add **multi-language support**

### Deployment & Scale
- Deploy to **Heroku / Render / Railway** for public access
- Use **Docker** for containerized deployment
- Add **rate limiting** and **API key authentication** for production
- Set up **monitoring & logging** (Sentry, DataDog)
- Use **Redis** for caching TF-IDF vectorizer
- Implement **background job queue** (Celery) for batch processing

### UI/UX
- Add **confidence threshold slider** — let users adjust spam cutoff
- Implement **comparison tool** — analyze multiple emails side-by-side
- Add **email parser** — extract from raw email format (headers, MIME)
- Create **mobile app** (React Native or Flutter)

---

## 🤝 Contributing

Pull requests welcome! Some ideas:

1. Optimize TF-IDF for larger datasets
2. Add more test cases for edge cases
3. Improve preprocessing for multilingual emails
4. Add more LLM backends (Claude, GPT, Gemini)
5. Implement continuous integration (GitHub Actions)

---

## 📝 License

MIT License — Feel free to use, modify, and distribute.

---

## 🙋 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: [your-email@example.com](mailto:your-email@example.com)
- Check the [Wiki](https://github.com/imSHR3YA/spam-detector/wiki) for FAQs

---

## Changelog

### v2.0 (Latest)
✨ **8 New Features:**
- Word heatmap visualization with spam signal colors
- History log for last 5 analyses
- Batch CSV upload with summary statistics
- Live stats counter with animations
- Dark/light mode toggle (localStorage-persisted)
- PDF report export (jsPDF integration)
- Analysis speed timer (milliseconds)
- Ollama hybrid LLM fallback (auto-escalation for low confidence)

**Backend Changes:**
- `/predict` now returns `word_scores`, `annotated_html`, `model_used`, `reasoning`
- New endpoint: `/predict_batch` for CSV batch processing
- Optional Ollama integration (graceful fallback if unavailable)

**Frontend Changes:**
- Dual-tab UI (Single Email / Batch CSV)
- Heatmap rendering with color-coded marks
- History list with timestamps
- Stats counters with count-up animation
- Dark mode toggle with smooth transitions
- PDF export button with jsPDF
- Model badge and AI reasoning display
- Analysis timer display

### v1.0 (Original)
- Single email analysis
- TF-IDF + Logistic Regression model
- Basic UI with result card
- Health check endpoint

---

**Happy spam detecting! 🎉**
