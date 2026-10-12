import json
import random
import os
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Load quotes once at startup
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "quotes.json")
with open(DATA_PATH, encoding="utf-8") as f:
    QUOTES = json.load(f)


@app.route("/")
def index():
    """Serve the main single-page application."""
    return render_template("index.html")


@app.route("/api/quotes/random")
def random_quote():
    """Return a single random quote."""
    return jsonify(random.choice(QUOTES))


@app.route("/api/quotes")
def search_quotes():
    """
    Search/filter quotes.

    Query params:
        author   (str) : partial, case-insensitive author name filter
        category (str) : exact category match (case-insensitive)
    """
    author = request.args.get("author", "").lower().strip()
    category = request.args.get("category", "").lower().strip()

    results = [
        q for q in QUOTES
        if (not author or author in q["author"].lower())
        and (not category or category in [c.lower() for c in q["categories"]])
    ]
    return jsonify(results)


@app.route("/api/authors")
def get_authors():
    """Return a sorted list of all unique authors."""
    authors = sorted({q["author"] for q in QUOTES})
    return jsonify(authors)


@app.route("/api/categories")
def get_categories():
    """Return a sorted list of all unique categories."""
    categories = sorted({c for q in QUOTES for c in q["categories"]})
    return jsonify(categories)


if __name__ == "__main__":
    app.run(debug=True)
