const STORAGE_KEY = "quoteList";
const LAST_QUOTE_KEY = "lastViewedQuote";
let quotes = loadQuotesFromStorage();
const app = document.getElementById("app");

// --- Create UI Elements ---
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "1rem 0";
quoteDisplay.style.padding = "1rem";
quoteDisplay.style.border = "1px solid #ccc";
app.appendChild(quoteDisplay);

const categoryLabel = document.createElement("label");
categoryLabel.innerText = "Select category: ";
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
app.appendChild(categoryLabel);
app.appendChild(categorySelect);

const newQuoteBtn = document.createElement("button");
newQuoteBtn.innerText = "Show New Quote";
newQuoteBtn.style.marginLeft = "10px";
app.appendChild(newQuoteBtn);

// --- Load and Save ---
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotesFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [
    { text: "Believe in yourself and all that you are.", category: "Motivation" },
    { text: "Simplicity is the soul of efficiency.", category: "Design" },
    { text: "Success is not in what you have, but who you are.", category: "Success" },
  ];
}

// --- Category Dropdown ---
function updateCategoryOptions() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.innerText = "All";
  categorySelect.appendChild(allOption);

  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    categorySelect.appendChild(option);
  });
}

// --- Quote Display ---
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex].text;
  quoteDisplay.innerText = quote;

  // Save in session storage
  sessionStorage.setItem(LAST_QUOTE_KEY, quote);
}

// --- Add Quote Form ---
function createAddQuoteForm() {
  const container = document.createElement("div");
  container.style.marginTop = "1.5rem";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginLeft = "5px";

  const addBtn = document.createElement("button");
  addBtn.innerText = "Add Quote";
  addBtn.style.marginLeft = "5px";

  addBtn.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (!text || !category) return alert("Fill in both fields.");

    quotes.push({ text, category });
    saveQuotes();
    updateCategoryOptions();
    quoteInput.value = "";
    categoryInput.value = "";
    alert("Quote added!");
  });

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
  app.appendChild(container);
}

// --- JSON Export ---
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// --- JSON Import ---
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
      quotes.push(...imported);
      saveQuotes();
      updateCategoryOptions();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// --- Restore last session quote ---
const last = sessionStorage.getItem(LAST_QUOTE_KEY);
if (last) quoteDisplay.innerText = `Last viewed: "${last}"`;

// --- Init ---
updateCategoryOptions();
createAddQuoteForm();
newQuoteBtn.addEventListener("click", showRandomQuote);
