const bookService = require("../services/bookService");

const VALID_STATUSES = ["Read", "Unread"];

// GET /api/books
const getAllBooks = async (req, res, next) => {
  try {
    let books = await bookService.getAllBooks();

    const { status, search } = req.query;

    // Filter by status
    if (status) {
      const normalizedStatus =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either Read or Unread",
        });
      }

      books = books.filter((book) => book.status === normalizedStatus);
    }

    // Bonus: Search by title or author
    if (search) {
      const searchTerm = search.toLowerCase();

      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm),
      );
    }

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id
const getBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await bookService.getBookById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books
const createBook = async (req, res, next) => {
  try {
    const { title, author, status, description } = req.body;

    // Required field validation
    if (
            !title?.trim() ||
            !author?.trim() ||
            !status ||
            !description?.trim()
        ) {
      return res.status(400).json({
        success: false,
        message: "Title, author, status and description are required",
      });
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Read or Unread",
      });
    }

    const newBook = await bookService.createBook({
      title: title.trim(),
      author: author.trim(),
      status,
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/books/:id/status
const updateBookStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Read or Unread",
      });
    }

    const updatedBook = await bookService.updateBookStatus(id, status);

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book status updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const deletedBook = await bookService.deleteBook(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBook,
  createBook,
  updateBookStatus,
  deleteBook,
};
