require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const settingsRoutes = require("./routes/settingsRoutes");
const db = require("./db");
const visitorRoutes = require("./routes/visitorRoutes");
const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const userRoutes = require("./routes/userRoutes");
const requireAdmin = require("./middleware/adminMiddleware");
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//     res.json({
//         message: "Reception Management API is running"
//     });
// });

app.get("/api/test-db", (req, res) => {

    db.query("SELECT 1 AS result", (err, results) => {

        if (err) {

            console.error("Database query error:", err);

            return res.status(500).json({
                success: false,
                message: "Database query failed",
                error: err.message
            });

        }

        res.json({
            success: true,
            message: "Database connected successfully",
            result: results
        });

    });

});

app.use("/api/visitors", authenticateToken, visitorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, requireAdmin, userRoutes);
const frontendPath = path.join(__dirname, "..", "dist");
app.use(express.static(frontendPath));
app.use("/api/settings", authenticateToken, requireAdmin, settingsRoutes);

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);