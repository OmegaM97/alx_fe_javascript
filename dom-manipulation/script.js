// Quote data
const quotes = [
  { text: "Believe in yourself and all that you are.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Design" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
];

const app = document.getElementById("app");

// Display area
const quoteDisplay = document.createElement("div");
quoteDisplay.id = "quoteDisplay";
quoteDisplay.style.margin = "1rem 0";
quoteDisplay.innerText = "Click 'Show New Quote' to get started.";
app.appendChild(quoteDisplay);

// Category dropdown
const categoryLabel = document.createElement("label");
categoryLabel.innerText = "Select category: ";
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
app.appendChild(categoryLabel);
app.appendChild(categorySelect);

// Show quote button
const newQuoteBtn = document.createElement("button");
newQuoteBtn.id = "newQuote";
newQuoteBtn.innerText = "Show New Quote";
newQuoteBtn.style.marginLeft = "10px";
app.appendChild(newQuoteBtn);

// Updates the dropdown
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

// Displays a random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes in this category.";
    return;
  }

  const random = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = filteredQuotes[random].text;
}

// 🔥 THIS is the required function
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.style.marginTop = "2rem";

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

    if (!text || !category) {
      alert("Fill both fields.");
      return;
    }

    quotes.push({ text, category });
    updateCategoryOptions();
    quoteInput.value = "";
    categoryInput.value = "";
    alert("Quote added.");
  });

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
  app.appendChild(formContainer);
}

// Add listeners and setup
newQuoteBtn.addEventListener("click", showRandomQuote);
updateCategoryOptions();
createAddQuoteForm(); // ✅ Call the required function
