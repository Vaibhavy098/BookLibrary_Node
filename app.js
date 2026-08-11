const express = require("express");
const path = require("path")

const bookRoutes = require("./routes/bookRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// parse JSON request bodies.
app.use(express.json());

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/books", bookRoutes);

// Handle unknow routes
app.use((req, res) => {
    res.status(404).json({
        success: false, 
        message: "Route not found"
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
