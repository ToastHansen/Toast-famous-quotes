# Famous Quotes

A web application built with **Python Flask** (backend) and **plain Vanilla JavaScript + HTML/CSS** (frontend) that displays 100 famous quotes with search and filter functionality.

## Features

- 🎲 **Random Quote** — a new quote on every load, with a "New Quote" button
- 🔍 **Search by Author** — type a partial name with autocomplete suggestions
- 🏷️ **Filter by Category** — dropdown with 10 categories (Motivation, Wisdom, Leadership, etc.)
- 💡 **Click a category pill** on any card to instantly filter by that category
- 🌙 **Dark / Light mode** — toggle with the 🌙 button; preference is saved
- 📱 **Responsive** — works on desktop and mobile

## Project Structure

```
famous-quotes/
├── app.py              # Flask app & REST API
├── data/
│   └── quotes.json     # 100 curated quotes
├── static/
│   ├── css/style.css
│   └── js/app.js
├── templates/
│   └── index.html
├── requirements.txt
└── README.md
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Serves the SPA |
| GET | `/api/quotes/random` | Returns one random quote |
| GET | `/api/quotes?author=X&category=Y` | Search / filter quotes |
| GET | `/api/authors` | All unique authors (sorted) |
| GET | `/api/categories` | All unique categories (sorted) |

## Running Locally

```powershell
# 1. Create & activate a virtual environment (recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
python app.py

# 4. Open your browser
# http://localhost:5000
```
