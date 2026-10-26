// Student Reading List Application (Lecture 11)
let books = JSON.parse(localStorage.getItem("student_reading_list")) || [
  { id: "1", title: "Python Crash Course", status: "Finished" },
  { id: "2", title: "Automate the Boring Stuff with Python", status: "Reading" },
  { id: "3", title: "Storytelling with Data", status: "Want to Read" }
];

let activeFilter = "All";

// DOM Elements
const bookForm = document.getElementById("bookForm");
const bookTitleInput = document.getElementById("bookTitle");
const bookStatusInput = document.getElementById("bookStatus");
const formFeedback = document.getElementById("formFeedback");
const bookList = document.getElementById("bookList");
const emptyMessage = document.getElementById("emptyMessage");
const totalCount = document.getElementById("totalCount");
const readingCount = document.getElementById("readingCount");
const finishedCount = document.getElementById("finishedCount");
const filterButtons = document.querySelectorAll(".filter-btn");

function saveBooks() {
  localStorage.setItem("student_reading_list", JSON.stringify(books));
}

function updateSummary() {
  const total = books.length;
  const reading = books.filter(b => b.status === "Reading").length;
  const finished = books.filter(b => b.status === "Finished").length;

  totalCount.textContent = total;
  readingCount.textContent = reading;
  finishedCount.textContent = finished;
}

function normalizeTitle(str) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

function renderBooks() {
  updateSummary();
  bookList.innerHTML = "";

  const filteredBooks = activeFilter === "All" 
    ? books 
    : books.filter(b => b.status === activeFilter);

  if (filteredBooks.length === 0) {
    emptyMessage.style.display = "block";
    if (books.length > 0) {
      emptyMessage.querySelector("p").textContent = `No books marked as "${activeFilter}".`;
    } else {
      emptyMessage.querySelector("p").textContent = "Your reading list is empty. Add your first book.";
    }
  } else {
    emptyMessage.style.display = "none";
    filteredBooks.forEach(book => {
      const card = document.createElement("div");
      card.className = `book-card ${book.status.replace(/\s+/g, "-")}`;
      
      card.innerHTML = `
        <div class="book-info">
          <h3 class="book-title">${escapeHTML(book.title)}</h3>
        </div>
        <div class="book-actions">
          <select class="status-select" data-id="${book.id}">
            <option value="Want to Read" ${book.status === "Want to Read" ? "selected" : ""}>Want to Read</option>
            <option value="Reading" ${book.status === "Reading" ? "selected" : ""}>Reading</option>
            <option value="Finished" ${book.status === "Finished" ? "selected" : ""}>Finished</option>
          </select>
          <button class="delete-btn" data-id="${book.id}">Delete</button>
        </div>
      `;
      bookList.appendChild(card);
    });
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Add Book Form Handler
bookForm.addEventListener("submit", function(e) {
  e.preventDefault();
  formFeedback.textContent = "";

  const title = bookTitleInput.value.trim();
  const status = bookStatusInput.value;

  // Defect Rule 2: Title length limit
  if (title.length > 60) {
    formFeedback.textContent = "Book title must be 60 characters or fewer.";
    return;
  }

  if (!title) {
    formFeedback.textContent = "Please enter a book title.";
    return;
  }

  // Defect Rule 1: Duplicate check ignoring casing and whitespace
  const normalizedNew = normalizeTitle(title);
  const exists = books.some(b => normalizeTitle(b.title) === normalizedNew);

  if (exists) {
    formFeedback.textContent = "This book is already in your reading list.";
    return;
  }

  const newBook = {
    id: Date.now().toString(),
    title: title,
    status: status
  };

  books.push(newBook);
  saveBooks();
  bookTitleInput.value = "";
  formFeedback.textContent = "";
  renderBooks();
});

// Event Delegation for Change Status and Delete
bookList.addEventListener("change", function(e) {
  if (e.target.classList.contains("status-select")) {
    const id = e.target.getAttribute("data-id");
    const newStatus = e.target.value;
    const book = books.find(b => b.id === id);
    if (book) {
      book.status = newStatus;
      saveBooks();
      renderBooks();
    }
  }
});

bookList.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    books = books.filter(b => b.id !== id);
    saveBooks();
    renderBooks();
  }
});

// Filter Buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", function() {
    filterButtons.forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    activeFilter = this.getAttribute("data-filter");
    renderBooks();
  });
});

// Initial Render
renderBooks();
