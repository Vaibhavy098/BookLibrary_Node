const fs = require("fs").promises;
const path = require("path");

const booksFilePath = path.join(__dirname, "../data/books.json");

const readBooks = async () => {
  const data = await fs.readFile(booksFilePath, "utf-8");

  return JSON.parse(data);
};

const writeBooks = async (books) => {
  await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), "utf-8");
};

const getNextId = (books) => {
  if (books.length === 0) {
    return 1;
  }

  return Math.max(...books.map((book) => book.id)) + 1;
};

const getAllBooks = async () => {
  return await readBooks();
};

const getBookById = async (id) => {
  const books = await readBooks();

  return books.find((book) => book.id === id);
};

const createBook = async (bookData) => {
  const books = await readBooks();

  const newBook = {
    id: getNextId(books),
    title: bookData.title,
    author: bookData.author,
    status: bookData.status,
    description: bookData.description,
    date: new Date().toISOString(),
  };

  books.push(newBook);

  await writeBooks(books);

  return newBook;
};

const updateBookStatus = async (id, status) => {
  const books = await readBooks();

  const book = books.find((book) => book.id === id);

  if (!book) {
    return null;
  }

  book.status = status;

  await writeBooks(books);

  return book;
};

const deleteBook = async (id) => {
  const books = await readBooks();

  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    return null;
  }

  const deletedBook = books.splice(bookIndex, 1)[0];

  await writeBooks(books);

  return deletedBook;
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBookStatus,
  deleteBook,
};
