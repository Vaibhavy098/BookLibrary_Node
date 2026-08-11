const express = require("express");

const bookController = require("../controllers/bookController");

const router = express.Router();

// Get all books
// Optional query parameters:
// ?status=Read
// ?status=Unread
// ?search=alchemist
router.get("/", bookController.getAllBooks);

// Get a single book
router.get("/:id", bookController.getBook);

// Create a book
router.post("/", bookController.createBook);

// Update book status
router.patch("/:id/status", bookController.updateBookStatus);

// Delete a book
router.delete("/:id", bookController.deleteBook);

module.exports = router;
