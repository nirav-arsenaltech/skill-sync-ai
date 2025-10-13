# 🚀 SkillSync.ai

**SkillSync.ai** is an AI-powered resume and job description matcher built with **Laravel 12**, **React**, and **Inertia.js** — empowering job seekers and hiring teams to instantly assess resume relevance, identify skill gaps, and improve hiring efficiency.

---

## 🔗 Live Demo

🌐 [http://skillsync.ai](http://skillsync.ai)

---

## 🧠 Features

- 🤖 AI-powered resume-job matching using **Gemini 2.5 Flash**
- 📄 Upload job descriptions & resumes (PDF, DOCX, DOC, TXT, JSON, XML)
- 📊 Get scores: Match %, Keyword %, Semantic Score, Keyword Gap
- 📥 Download AI Scan Report (PDF)
- 🔍 Automatic **skill extraction**, comparison & gap analysis
- 💬 Full AI-generated summary for each resume
- 🔒 Authenticated dashboard (Laravel Breeze)
- 💾 Resume storage & AI scan history
- 🧼 Robust file validation & encoding cleanup

---

## 🏗️ Tech Stack

| Layer        | Technology                      |
|--------------|----------------------------------|
| Backend      | Laravel 12 (PHP 8.2)             |
| Frontend     | React.js + Inertia.js            |
| Authentication | Laravel Breeze               |
| Database     | MySQL                            |
| Styling      | Tailwind CSS                     |
| AI Engine    | Gemini-2.5-flash (Google AI)     |
| File Parsing | PhpWord, Spatie PdfToText, LibreOffice CLI |
| Build Tools  | Vite, Laravel Mix, Composer, NPM |

---

## 📂 Resume File Support

| Format | Support       | Parser                     |
|--------|---------------|----------------------------|
| `.pdf` | ✅ Supported   | Spatie PdfToText           |
| `.docx`| ✅ Supported   | PhpOffice PhpWord          |
| `.doc` | ✅ With LibreOffice | LibreOffice CLI         |
| `.txt` | ✅ Supported   | Native PHP                 |

> ⚠️ `.doc` conversion requires LibreOffice installed (`soffice` CLI). If unavailable, it's skipped with a warning.

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/nirav-arsenaltech/skill-sync-ai.git
cd skill-sync-ai

# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure your .env
# DB_DATABASE=skill_sync
# DB_USERNAME=root
# DB_PASSWORD=yourpassword

# Run database migrations
php artisan migrate

# Create symbolic link for storage
php artisan storage:link

# Start the local servers
php artisan serve
npm run dev
```
## 🌐 .env Configuration

```
Set up your environment variables:

APP_NAME=SkillSync.ai
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skill_sync
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public

# AI Integration
AI_DRIVER=gemini
GOOGLE_AI_KEY=your_gemini_api_key
```

---
## ✅ Testing (Optional)

You can run Laravel tests using:

`php artisan test`

---

## 👨‍💻 Author

- Developed by [Nirav](https://github.com/nirav-arsenaltech)

---

## ⭐ Support & Contribute

We welcome contributions and ideas to improve **SkillSync.ai**! 🚀

### 🤝 How to Contribute

- Fork the repo
- Create your feature branch (`git checkout -b feature/your-feature`)
- Commit your changes (`git commit -m 'Add some feature'`)
- Push to the branch (`git push origin feature/your-feature`)
- Open a Pull Request

### 🛠️ Found a Bug?

Please open an [Issue](https://github.com/nirav-arsenaltech/skill-sync-ai/issues) with steps to reproduce and, if possible, screenshots or error logs.

### ❤️ Support the Project

If you find this project helpful, consider giving it a ⭐ on GitHub.  
You can also [share it](https://github.com/nirav-arsenaltech/skill-sync-ai) with friends or on social platforms to help others benefit from it.

---


## 📄 License

- This project is open-sourced under the [MIT License](LICENSE).
- Feel free to use, modify, and distribute with proper attribution.
