const STORAGE_QUOTES = "quoteList";
const STORAGE_FILTER = "selectedCategory";
let quotes = loadQuotes();
const app = document.getElementById("app");

// UI elements
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

const syncNotice = document.getElementById("syncNotice");

// --- Load and Save Quotes ---
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

// --- Filter Quotes (display all matching) ---
function filterQuotes() {
  const selected = categoryFilter.value;
  const pool = selected === "All" ? quotes : quotes.filter(q => q.category === selected);

  quoteDisplay.textContent = ""; // clear previous

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

  addBtn.addEventListener("click", async () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (!text || !category) return alert("Both fields are required!");

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    quoteInput.value = "";
    categoryInput.value = "";

    try {
      await postQuoteToServer(newQuote);
      alert("Quote added and synced to server!");
    } catch {
      alert("Quote added locally, but failed to sync with server.");
    }
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
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
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

// --- Server API using JSONPlaceholder ---
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server and map them to {text, category}
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL + "?_limit=10"); // limit to 10 for demo
    const data = await response.json();

    let added = 0;
    let conflicts = 0;

    // Map server posts to quote format:
    // Use `title` as `text`, `body` as `category`
    data.forEach(post => {
      const serverQuote = { text: post.title, category: post.body || "General" };

      const exists = quotes.some(localQuote =>
        localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
      );

      if (!exists) {
        const conflict = quotes.find(localQuote =>
          localQuote.text === serverQuote.text && localQuote.category !== serverQuote.category
        );

        if (conflict) {
          quotes = quotes.filter(q => q !== conflict);
          quotes.push(serverQuote);
          conflicts++;
        } else {
          quotes.push(serverQuote);
          added++;
        }
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    if (added > 0 || conflicts > 0) {
      syncNotice.textContent = `🔄 Synced: ${added} added, ${conflicts} conflict(s) resolved.`;
      setTimeout(() => syncNotice.textContent = "", 4000);
    }
  } catch (err) {
    console.error("Failed to fetch from server:", err);
    syncNotice.textContent = "⚠️ Failed to sync with server.";
    setTimeout(() => (syncNotice.textContent = ""), 4000);
  }
}

// Post new quote to JSONPlaceholder (this won't actually store but simulates success)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (err) {
    console.error("Failed to post quote to server:", err);
    throw err;
  }
}

// Manual sync button
document.getElementById("syncNowBtn").addEventListener("click", fetchQuotesFromServer);

// Periodic sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// --- Initialize UI ---
createAddQuoteForm();
populateCategories();
filterQuotes();
