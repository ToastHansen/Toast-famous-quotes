/* ============================================================
   Famous Quotes — app.js
   Plain Vanilla JavaScript — no frameworks or libraries.
   ============================================================ */

// ── DOM References ────────────────────────────────────────────
const randomCard     = document.getElementById('random-quote-card');
const newQuoteBtn    = document.getElementById('new-quote-btn');
const themeToggle    = document.getElementById('theme-toggle');
const authorInput    = document.getElementById('author-input');
const categorySelect = document.getElementById('category-select');
const clearBtn       = document.getElementById('clear-btn');
const resultsGrid    = document.getElementById('results-grid');
const resultsMeta    = document.getElementById('results-meta');
const noResults      = document.getElementById('no-results');
const authorsDatalist = document.getElementById('authors-datalist');

// ── Theme ─────────────────────────────────────────────────────
const htmlEl = document.documentElement;

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('quotes-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Restore saved theme or use system preference
(function initTheme() {
  const saved = localStorage.getItem('quotes-theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
})();

// ── Quote Card Builder ────────────────────────────────────────
/**
 * Builds and returns a .quote-card DOM element for a given quote object.
 * @param {Object} quote  – { id, text, author, categories }
 * @param {boolean} isHero – if true, applies the hero card style
 */
function buildQuoteCard(quote, isHero = false) {
  const card = document.createElement('article');
  card.className = 'quote-card' + (isHero ? ' hero-card' : '');
  card.setAttribute('data-id', quote.id);

  const text = document.createElement('p');
  text.className = 'quote-text';
  text.textContent = quote.text;

  const author = document.createElement('p');
  author.className = 'quote-author';
  author.textContent = quote.author;

  const pills = document.createElement('div');
  pills.className = 'quote-categories';

  quote.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-pill';
    btn.textContent = cat;
    btn.setAttribute('aria-label', `Filter by ${cat}`);
    btn.addEventListener('click', () => filterByCategory(cat));
    pills.appendChild(btn);
  });

  card.append(text, author, pills);
  return card;
}

// ── Random Quote ──────────────────────────────────────────────
async function loadRandomQuote() {
  // Fade out
  randomCard.classList.add('fade-out');

  await sleep(280);

  try {
    const res = await fetch('/api/quotes/random');
    if (!res.ok) throw new Error('Network error');
    const quote = await res.json();

    randomCard.innerHTML = '';
    randomCard.appendChild(buildQuoteCard(quote, true));
  } catch (err) {
    randomCard.innerHTML = `<p class="quote-text" style="text-align:center;color:var(--text-muted)">
      Could not load quote. Please refresh.
    </p>`;
    console.error('Failed to load random quote:', err);
  }

  // Fade back in
  randomCard.classList.remove('fade-out');
  randomCard.classList.add('fade-in');
  setTimeout(() => randomCard.classList.remove('fade-in'), 400);
}

newQuoteBtn.addEventListener('click', loadRandomQuote);

// ── Search & Filter ───────────────────────────────────────────
let searchDebounceTimer = null;

function triggerSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(runSearch, 300);
}

async function runSearch() {
  const author   = authorInput.value.trim();
  const category = categorySelect.value;

  // If nothing entered, clear results
  if (!author && !category) {
    clearResults();
    return;
  }

  const params = new URLSearchParams();
  if (author)   params.set('author', author);
  if (category) params.set('category', category);

  try {
    const res = await fetch(`/api/quotes?${params}`);
    if (!res.ok) throw new Error('Network error');
    const quotes = await res.json();
    renderResults(quotes, author, category);
  } catch (err) {
    console.error('Search failed:', err);
  }
}

function renderResults(quotes, author, category) {
  resultsGrid.innerHTML = '';
  noResults.classList.add('hidden');

  if (quotes.length === 0) {
    resultsMeta.textContent = '';
    noResults.classList.remove('hidden');
    return;
  }

  // Build meta label
  const parts = [];
  if (author)   parts.push(`author contains "${author}"`);
  if (category) parts.push(`category "${category}"`);
  resultsMeta.textContent =
    `${quotes.length} quote${quotes.length !== 1 ? 's' : ''} matching ${parts.join(' + ')}`;

  // Render cards with staggered animation delay
  quotes.forEach((quote, idx) => {
    const card = buildQuoteCard(quote);
    card.style.animationDelay = `${idx * 40}ms`;
    resultsGrid.appendChild(card);
  });
}

function clearResults() {
  resultsGrid.innerHTML = '';
  resultsMeta.textContent = '';
  noResults.classList.add('hidden');
}

// Category pill click → sets dropdown and runs search
function filterByCategory(cat) {
  categorySelect.value = cat;
  authorInput.value = '';
  runSearch();
  // Smooth scroll to search section
  document.querySelector('.search-section').scrollIntoView({ behavior: 'smooth' });
}

// Clear button
clearBtn.addEventListener('click', () => {
  authorInput.value = '';
  categorySelect.value = '';
  clearResults();
});

// Input listeners
authorInput.addEventListener('input', triggerSearch);
categorySelect.addEventListener('change', triggerSearch);

// ── Populate Authors Datalist ─────────────────────────────────
async function loadAuthors() {
  try {
    const res = await fetch('/api/authors');
    if (!res.ok) return;
    const authors = await res.json();
    authors.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      authorsDatalist.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load authors:', err);
  }
}

// ── Populate Categories Dropdown ──────────────────────────────
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return;
    const categories = await res.json();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

// ── Utilities ─────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Bootstrap ─────────────────────────────────────────────────
(async function init() {
  // Kick off independent fetches in parallel
  await Promise.all([
    loadRandomQuote(),
    loadAuthors(),
    loadCategories(),
  ]);
})();
