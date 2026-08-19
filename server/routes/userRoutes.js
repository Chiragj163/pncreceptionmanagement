const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const db = require("../db");

router.get("/", (req, res) => {

    const sql = `
        SELECT
            id,
            username,
            full_name,
            role,
            status,
            created_at
        FROM users
        ORDER BY id DESC
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Get users error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });

        }


        res.json({
            success: true,
            users: results
        });

    });

});

router.post("/", async (req, res) => {

    const {
        username,
        password,
        full_name,
        role
    } = req.body;


    if (
        !username ||
        !password ||
        !full_name
    ) {

        return res.status(400).json({
            success: false,
            message: "Username, password and full name are required"
        });

    }


    if (
        role !== "Admin" &&
        role !== "Receptionist"
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid role"
        });

    }


    try {

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const sql = `
            INSERT INTO users
            (
                username,
                password,
                full_name,
                role
            )
            VALUES (?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                username,
                hashedPassword,
                full_name,
                role
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Create user error:",
                        err
                    );


                    if (
                        err.code ===
                        "ER_DUP_ENTRY"
                    ) {

                        return res.status(409).json({
                            success: false,
                            message: "Username already exists"
                        });

                    }


                    return res.status(500).json({
                        success: false,
                        message: "Failed to create user"
                    });

                }


                res.status(201).json({

                    success: true,

                    message:
                        "User created successfully",

                    userId:
                        result.insertId

                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });

    }

});

router.put("/:id/status", (req, res) => {

    const userId = Number(req.params.id);

    const { status } = req.body;


    if (
        status !== "Active" &&
        status !== "Inactive"
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });

    }

    if (
        userId === Number(req.user.id) &&
        status === "Inactive"
    ) {

        return res.status(400).json({
            success: false,
            message:
                "You cannot deactivate your own account"
        });

    }


    const sql = `
        UPDATE users
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [status, userId],
        (err, result) => {

            if (err) {

                console.error(
                    "Update user status error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update user"
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }


            res.json({
                success: true,
                message: "User status updated"
            });

        }
    );

});


module.exports = router;