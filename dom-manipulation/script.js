// Initial quote data
const quotes = [
  { text: "Believe in yourself and all that you are.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
];

const app = document.getElementById("app");

// --- Create DOM Elements Dynamically ---

// Quote display
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "1rem 0";
quoteDisplay.style.padding = "1rem";
quoteDisplay.style.border = "1px solid #ccc";
quoteDisplay.innerText = "Click 'Show New Quote' to get started.";
app.appendChild(quoteDisplay);

// Category selection
const categoryLabel = document.createElement("label");
categoryLabel.innerText = "Select category: ";
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
app.appendChild(categoryLabel);
app.appendChild(categorySelect);

// Button to show a new quote
const newQuoteBtn = document.createElement("button");
newQuoteBtn.id = "newQuote";
newQuoteBtn.innerText = "Show New Quote";
newQuoteBtn.style.marginLeft = "10px";
app.appendChild(newQuoteBtn);

// Add quote form
const formContainer = document.createElement("div");
formContainer.style.marginTop = "2rem";

const quoteInput = document.createElement("input");
quoteInput.id = "newQuoteText";
quoteInput.placeholder = "Enter a new quote";

const categoryInput = document.createElement("input");
categoryInput.id = "newQuoteCategory";
categoryInput.placeholder = "Enter quote category";
categoryInput.style.marginLeft = "5px";

const addQuoteBtn = document.createElement("button");
addQuoteBtn.innerText = "Add Quote";
addQuoteBtn.style.marginLeft = "5px";

formContainer.appendChild(quoteInput);
formContainer.appendChild(categoryInput);
formContainer.appendChild(addQuoteBtn);
app.appendChild(formContainer);

// --- Functions ---

function updateCategoryOptions() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.innerText = "All";
  categorySelect.appendChild(allOption);

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes found in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = filteredQuotes[randomIndex].text;
}

function addQuote() {
  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  updateCategoryOptions();
  quoteInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// --- Event Listeners ---
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initial setup
updateCategoryOptions();
