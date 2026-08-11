const API_URL = "/api/books";

// DOM elements
const booksContainer = document.getElementById("booksContainer");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const noBooksMessage = document.getElementById("noBooksMessage");

const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");

const addBookButton = document.getElementById("addBookButton");
const bookModal = document.getElementById("bookModal");
const detailsModal = document.getElementById("detailsModal");

const bookForm = document.getElementById("bookForm");
const detailsTitle = document.getElementById("detailsTitle");
const detailsContent = document.getElementById("detailsContent");

// --------------------------------------------------
// Load Books
// --------------------------------------------------

const loadBooks = async () => {
  try {
    showLoading(true);
    hideError();

    const status = statusFilter.value;
    const search = searchInput.value.trim();

    const params = new URLSearchParams();

    if (status) {
      params.append("status", status);
    }

    if (search) {
      params.append("search", search);
    }

    const queryString = params.toString();

    const response = await fetch(
      `${API_URL}${queryString ? `?${queryString}` : ""}`,
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load books");
    }

    displayBooks(result.data);
  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
};

// --------------------------------------------------
// Display Books
// --------------------------------------------------

const displayBooks = (books) => {
  booksContainer.innerHTML = "";

  if (books.length === 0) {
    noBooksMessage.classList.remove("d-none");
    return;
  }

  noBooksMessage.classList.add("d-none");

  books.forEach((book) => {
    const bookCard = createBookCard(book);

    booksContainer.appendChild(bookCard);
  });
};

// --------------------------------------------------
// Create Book Card
// --------------------------------------------------

const createBookCard = (book) => {
  const col = document.createElement("div");

  col.className = "col-md-6 col-lg-4";

  const statusClass =
    book.status === "Read" ? "bg-success" : "bg-warning text-dark";

  col.innerHTML = `
        <div class="card book-card h-100 shadow-sm">

            <div class="card-body d-flex flex-column">

                <div class="d-flex justify-content-between align-items-start mb-2">

                    <h5 class="card-title mb-0">
                        ${escapeHtml(book.title)}
                    </h5>

                    <span class="badge ${statusClass}">
                        ${book.status}
                    </span>

                </div>

                <h6 class="card-subtitle mb-3 text-muted">
                    ${escapeHtml(book.author)}
                </h6>

                <p class="card-text text-secondary flex-grow-1">
                    ${escapeHtml(book.description)}
                </p>

                <small class="text-muted mb-3">
                    Added:
                    ${formatDate(book.date)}
                </small>

                <div class="d-flex gap-2">

                    <button
                        class="btn btn-outline-primary btn-sm"
                        onclick="viewBook(${book.id})"
                    >
                        View Details
                    </button>

                    <button
                        class="btn btn-outline-success btn-sm"
                        onclick="toggleBookStatus(${book.id}, '${book.status}')"
                    >
                        Mark ${book.status === "Read" ? "Unread" : "Read"}
                    </button>

                    <button
                        class="btn btn-outline-danger btn-sm"
                        onclick="deleteBook(${book.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    `;

  return col;
};

// --------------------------------------------------
// Add Book
// --------------------------------------------------

bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const status = document.getElementById("status").value;
  const description = document.getElementById("description").value.trim();

  if (!title || !author || !description) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        author,
        status,
        description,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create book");
    }

    closeModal(bookModal);

    bookForm.reset();

    await loadBooks();
  } catch (error) {
    showError(error.message);
  }
});

// --------------------------------------------------
// View Book Details
// --------------------------------------------------

const viewBook = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to get book details");
    }

    const book = result.data;

    detailsTitle.textContent = book.title;

    detailsContent.innerHTML = `
            <div class="mb-3">
                <strong>Title:</strong>
                <p>${escapeHtml(book.title)}</p>
            </div>

            <div class="mb-3">
                <strong>Author:</strong>
                <p>${escapeHtml(book.author)}</p>
            </div>

            <div class="mb-3">
                <strong>Status:</strong>
                <p>
                    <span class="badge ${
                      book.status === "Read"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }">
                        ${book.status}
                    </span>
                </p>
            </div>

            <div class="mb-3">
                <strong>Description:</strong>
                <p>${escapeHtml(book.description)}</p>
            </div>

            <div>
                <strong>Date Added:</strong>
                <p>${formatDate(book.date)}</p>
            </div>
        `;

    openModal(detailsModal);
  } catch (error) {
    showError(error.message);
  }
};

// --------------------------------------------------
// Update Book Status
// --------------------------------------------------

const toggleBookStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "Read" ? "Unread" : "Read";

  try {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update status");
    }

    await loadBooks();
  } catch (error) {
    showError(error.message);
  }
};

// --------------------------------------------------
// Delete Book
// --------------------------------------------------

const deleteBook = async (id) => {
  const confirmed = confirm("Are you sure you want to delete this book?");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete book");
    }

    await loadBooks();
  } catch (error) {
    showError(error.message);
  }
};

// --------------------------------------------------
// Filtering
// --------------------------------------------------

statusFilter.addEventListener("change", () => {
  loadBooks();
});

// --------------------------------------------------
// Search
// --------------------------------------------------

let searchTimeout;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    loadBooks();
  }, 300);
});

// --------------------------------------------------
// Add Book Modal
// --------------------------------------------------

addBookButton.addEventListener("click", () => {
  openModal(bookModal);
});

// --------------------------------------------------
// Modal Handling
// --------------------------------------------------

const openModal = (modal) => {
  modal.classList.add("show");
  modal.style.display = "block";

  document.body.classList.add("modal-open");

  const backdrop = document.createElement("div");

  backdrop.className = "custom-modal-backdrop";

  backdrop.addEventListener("click", () => {
    closeModal(modal);
  });

  modal._backdrop = backdrop;

  document.body.appendChild(backdrop);
};

const closeModal = (modal) => {
  modal.classList.remove("show");
  modal.style.display = "none";

  document.body.classList.remove("modal-open");

  if (modal._backdrop) {
    modal._backdrop.remove();
    modal._backdrop = null;
  }
};

// Close buttons
document.querySelectorAll(".btn-close").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");

    if (modal) {
      closeModal(modal);
    }
  });
});

// Cancel button
document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");

    if (modal) {
      closeModal(modal);
    }
  });
});

// --------------------------------------------------
// Utility Functions
// --------------------------------------------------

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const escapeHtml = (value) => {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
};

const showLoading = (show) => {
  if (show) {
    loadingMessage.classList.remove("d-none");
  } else {
    loadingMessage.classList.add("d-none");
  }
};

const showError = (message) => {
  errorMessage.textContent = message;

  errorMessage.classList.remove("d-none");
};

const hideError = () => {
  errorMessage.classList.add("d-none");
};

// --------------------------------------------------
// Initial Application Load
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
});
