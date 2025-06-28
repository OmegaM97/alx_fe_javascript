const STORAGE_QUOTES = "quoteList";
const STORAGE_FILTER = "selectedCategory";
let quotes = loadQuotes();
const app = document.getElementById("app");

// --- UI Elements ---
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "1rem 0";
quoteDisplay.style.padding = "1rem";
quoteDisplay.style.border = "1px solid #ccc";
app.appendChild(quoteDisplay);

const categoryFilterLabel = document.createElement("label");
categoryFilterLabel.textContent = "Filter by category: ";
const categoryFilter = document.createElement("select");
categoryFilter.id = "categoryFilter";
categoryFilter.addEventListener("change", filterQuotes);
app.appendChild(categoryFilterLabel);
app.appendChild(categoryFilter);

const showQuoteBtn = document.createElement("button");
showQuoteBtn.textContent = "Show Random Quote";
showQuoteBtn.style.marginLeft = "10px";
showQuoteBtn.addEventListener("click", showRandomQuote);
app.appendChild(showQuoteBtn);

// --- Load/Save Quotes ---
function loadQuotes() {
  const data = localStorage.getItem(STORAGE_QUOTES);
  return data ? JSON.parse(data) : [
    { text: "Believe in yourself and all that you are.", category: "Motivation" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Success is not in what you have, but who you are.", category: "Success" },
  ];
}

function saveQuotes() {
  localStorage.setItem(STORAGE_QUOTES, JSON.stringify(quotes));
}

// --- Populate Categories ---
function populateCategories() {
  const uniqueCats = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "All";
  allOpt.textContent = "All Categories";
  categoryFilter.appendChild(allOpt);

  uniqueCats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const lastFilter = localStorage.getItem(STORAGE_FILTER);
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

// --- Show Random Quote ---
function showRandomQuote() {
  const selected = categoryFilter.value;
  const pool = selected === "All" ? quotes : quotes.filter(q => q.category === selected);

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const random = Math.floor(Math.random() * pool.length);
  const quote = pool[random].text;
  quoteDisplay.textContent = quote;

  sessionStorage.setItem("lastQuote", quote);
  localStorage.setItem(STORAGE_FILTER, selected);
}

// --- Filter Quotes (display all matches) ---
function filterQuotes() {
  const selected = categoryFilter.value;
  const pool = selected === "All" ? quotes : quotes.filter(q => q.category === selected);

  quoteDisplay.textContent = ""; // Clear existing content

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }

  pool.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}"`;
    quoteDisplay.appendChild(p);
  });

  localStorage.setItem(STORAGE_FILTER, selected);
}

// --- Add Quote Form ---
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.style.marginTop = "2rem";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginLeft = "5px";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.style.marginLeft = "5px";

  addBtn.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (!text || !category) return alert("Both fields are required!");

    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes(); // Refresh view
    quoteInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  });

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);
  app.appendChild(form);
}

// --- JSON Import/Export ---
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", importFromJsonFile);

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid file format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported!");
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  reader.readAsText(file);
}

// --- Initialize ---
createAddQuoteForm();
populateCategories();
filterQuotes();
