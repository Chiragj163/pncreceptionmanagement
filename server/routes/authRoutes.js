require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();
const db = require("../db");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });

    }

    const sql = `
        SELECT
            id,
            username,
            password,
            full_name,
            role,
            status
        FROM users
        WHERE username = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [username],
        async (err, results) => {

            if (err) {

                console.error(
                    "Login database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Login failed"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password"
                });

            }

            const user = results[0];

            if (user.status !== "Active") {

                return res.status(403).json({
                    success: false,
                    message: "This account is inactive"
                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password"
                });

            }

            const token =
                jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "8h"
                    }
                );


            res.json({
                success: true,
                message: "Login successful",
                token,

                user: {

                    id: user.id,

                    username:
                        user.username,

                    fullName:
                        user.full_name,

                    role:
                        user.role

                }

            });

        }
    );

});

router.put(
    "/change-password",
    authenticateToken,
    async (req, res) => {

        const userId =
            req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });

        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });

        }

        try {

            const sql = `
                SELECT password
                FROM users
                WHERE id = ?
                LIMIT 1
            `;

            db.query(
                sql,
                [userId],
                async (err, results) => {

                    if (err) {

                        console.error(
                            "Password lookup error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to change password"
                        });

                    }

                    if (
                        results.length === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "User not found"
                        });

                    }

                    const user =
                        results[0];

                    const passwordMatch =
                        await bcrypt.compare(
                            currentPassword,
                            user.password
                        );

                    if (!passwordMatch) {

                        return res.status(400).json({
                            success: false,
                            message:
                                "Current password is incorrect"
                        });

                    }

                    const hashedPassword =
                        await bcrypt.hash(
                            newPassword,
                            10
                        );

                    const updateSql = `
                        UPDATE users
                        SET password = ?
                        WHERE id = ?
                    `;

                    db.query(
                        updateSql,
                        [
                            hashedPassword,
                            userId
                        ],
                        (updateErr) => {

                            if (updateErr) {

                                console.error(
                                    "Password update error:",
                                    updateErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update password"
                                });

                            }

                            res.json({

                                success: true,

                                message:
                                    "Password changed successfully"

                            });

                        }
                    );

                }
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to change password"

            });

        }

    }
);


module.exports = router;