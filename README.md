# 🚀 SkillSync.ai

AI-powered resume-job matcher built with Laravel 12, React, and Inertia.js — empowering job seekers and hiring teams to instantly assess resume relevance against job descriptions.


---

## 🔗 Live Project (Optional)
> _http://skillsync.ai/_

---

## 🧠 Features

- ✅ AI-Powered Resume & Job Matching (OpenAI/LLM)
- ✅ Skill Gap Analysis with JSON breakdown
- ✅ Job Description Upload
- ✅ Resume Upload (PDF, DOCX, DOC via LibreOffice)
- ✅ Resume Scoring: Match %, Keyword %, Semantic Score
- ✅ Laravel 12 (PHP 8.2) backend with MySQL
- ✅ React (w/ Inertia.js) frontend
- ✅ Tailwind CSS design system
- ✅ Auth (Breeze) + User Dashboard
- ✅ Error logging & fallback handling for unsupported formats

---

## 🏗️ Tech Stack

| Layer       | Technology                   |
|------------|-------------------------------|
| Backend     | Laravel 12 (PHP 8.2)          |
| Frontend    | React.js + Inertia.js         |
| Auth        | Laravel Breeze                |
| Database    | MySQL                         |
| CSS         | Tailwind CSS                  |
| AI Engine   | Gemini-2.5-flash              |
| File Parsing| PhpWord, Spatie PdfToText, LibreOffice CLI |
| Deployment  | Vite, Laravel Mix, Composer, NPM |

---


### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/nirav-arsenaltech/skill-sync-ai.git
cd skill-sync-ai

# Install dependencies
composer install
npm install

# Copy environment
cp .env.example .env

# Generate app key
php artisan key:generate

# Set database credentials in .env
# DB_DATABASE=skill_sync
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Link storage
php artisan storage:link

# Start dev server
php artisan serve
npm run dev
```
---
📎 Key AI Logic
```
AppNeuronMyAgent.php handles AI prompt formatting and response parsing

AI result includes:

overall_match_percentage

semantic_score

keyword_score

keyword_gap

Skill-by-skill match breakdown

AI results stored in matches table
---
```
