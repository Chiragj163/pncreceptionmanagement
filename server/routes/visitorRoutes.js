const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, (req, res) => {

    const {
        visitor_name,
        address,
        mobile,
        company_name,
        other_details,
        purpose,
        person_to_meet
    } = req.body;

    if (!visitor_name || !mobile || !purpose || !person_to_meet) {

        return res.status(400).json({
            success: false,
            message: "Please fill all required fields"
        });

    }


    const sql = `
        INSERT INTO visitors
        (
            visitor_name,
            address,
            mobile,
            company_name,
            other_details,
            purpose,
            person_to_meet,
            visit_date,
            in_time,
            status,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), 'Inside', ?)
    `;


    const values = [
        visitor_name,
        address || null,
        mobile,
        company_name || null,
        other_details || null,
        purpose,
        person_to_meet,
        req.user.id
    ];


    db.query(sql, values, (err, result) => {

        if (err) {

            console.error("Insert visitor error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to register visitor",
                error: err.message
            });

        }


        res.status(201).json({
            success: true,
            message: "Visitor registered successfully",
            visitorId: result.insertId
        });

    });

});

router.get("/", (req, res) => {

   const sql = `
    SELECT
        v.*,
        u.full_name AS created_by_name
    FROM visitors v
    LEFT JOIN users u
        ON v.created_by = u.id
    ORDER BY v.in_time DESC
`;

    db.query(sql, (err, results) => {

        if (err) {

            console.error("Get visitors error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch visitors"
            });

        }


        res.json({
            success: true,
            visitors: results
        });

    });

});

// Visitor history search
router.get("/history/search", (req, res) => {

    const {
        from,
        to,
        name,
        company,
        person,
        status
    } = req.query;


    let sql = `
        SELECT
            v.id,
            v.visitor_name,
            v.address,
            v.mobile,
            v.company_name,
            v.other_details,
            v.purpose,
            v.person_to_meet,
            v.visit_date,
            v.in_time,
            v.out_time,
            v.status,
            v.created_by,
            u.full_name AS created_by_name
        FROM visitors v
        LEFT JOIN users u
            ON v.created_by = u.id
        WHERE 1 = 1
            `;


    const values = [];

    if (from) {

        sql += `
            AND visit_date >= ?
        `;

        values.push(from);

    }

    if (to) {

        sql += `
            AND visit_date <= ?
        `;

        values.push(to);

    }

    if (name) {

        sql += `
            AND visitor_name LIKE ?
        `;

        values.push(`%${name}%`);

    }

    if (company) {

        sql += `
            AND company_name LIKE ?
        `;

        values.push(`%${company}%`);

    }

    if (person) {

        sql += `
            AND person_to_meet LIKE ?
        `;

        values.push(`%${person}%`);

    }

    if (status && status !== "All") {

        sql += `
            AND status = ?
        `;

        values.push(status);

    }

    sql += `
        ORDER BY in_time DESC
    `;


    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                console.error(
                    "History search error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to search visitor history",

                    error: err.message

                });

            }


            res.json({

                success: true,

                visitors: results

            });

        }
    );

});

router.get("/:id", (req, res) => {

    const visitorId = req.params.id;

    const sql = `
     SELECT
        v.id,
        v.visitor_name,
        v.address,
        v.mobile,
        v.company_name,
        v.other_details,
        v.purpose,
        v.person_to_meet,
        v.visit_date,
        v.in_time,
        v.out_time,
        v.status,
        v.created_at,
        v.created_by,
        u.full_name AS created_by_name
    FROM visitors v
    LEFT JOIN users u
        ON v.created_by = u.id
    WHERE v.id = ?
`;

    db.query(sql, [visitorId], (err, results) => {

        if (err) {

            console.error("Get visitor error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch visitor",
                error: err.message
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Visitor not found"
            });
        }

        res.json({
            success: true,
            visitor: results[0]
        });

    });

});

router.get("/reports/summary", (req, res) => {

    const { from, to } = req.query;

    let dateCondition = "WHERE 1 = 1";

    const values = [];

    if (from) {
        dateCondition += " AND visit_date >= ?";
        values.push(from);
    }

    if (to) {
        dateCondition += " AND visit_date <= ?";
        values.push(to);
    }


    const sql = `
        SELECT

            COUNT(*) AS total_visitors,

            SUM(
                CASE
                    WHEN status = 'Inside'
                    THEN 1
                    ELSE 0
                END
            ) AS currently_inside,

            SUM(
                CASE
                    WHEN status = 'Checked Out'
                    THEN 1
                    ELSE 0
                END
            ) AS checked_out,

            ROUND(
                AVG(
                    CASE
                        WHEN out_time IS NOT NULL
                        THEN TIMESTAMPDIFF(
                            MINUTE,
                            in_time,
                            out_time
                        )
                        ELSE NULL
                    END
                ),
                0
            ) AS average_duration

        FROM visitors

        ${dateCondition}
    `;


    db.query(sql, values, (err, results) => {

        if (err) {

            console.error(
                "Report summary error:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate report summary",

                error: err.message

            });

        }


        const row = results[0];


        res.json({

            success: true,

            summary: {

                totalVisitors:
                    Number(row.total_visitors || 0),

                currentlyInside:
                    Number(row.currently_inside || 0),

                checkedOut:
                    Number(row.checked_out || 0),

                averageDuration:
                    Number(row.average_duration || 0)

            }

        });

    });

});

router.get("/reports/visitors", (req, res) => {

    const { from, to } = req.query;

    let sql = `
       SELECT
            v.id,
            v.visitor_name,
            v.mobile,
            v.company_name,
            v.purpose,
            v.person_to_meet,
            v.visit_date,
            v.in_time,
            v.out_time,
            v.status,
            v.created_by,
            u.full_name AS created_by_name
        FROM visitors v
        LEFT JOIN users u
            ON v.created_by = u.id
                WHERE 1 = 1
            `;

    const values = [];


    if (from) {

        sql += `
            AND visit_date >= ?
        `;

        values.push(from);

    }


    if (to) {

        sql += `
            AND visit_date <= ?
        `;

        values.push(to);

    }


    sql += `
        ORDER BY in_time DESC
    `;


    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                console.error(
                    "Report visitors error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch report visitors",

                    error: err.message

                });

            }


            res.json({

                success: true,

                visitors: results

            });

        }
    );

});

router.put("/:id/checkout", (req, res) => {

    const visitorId = req.params.id;

    const sql = `
        UPDATE visitors
        SET
            out_time = NOW(),
            status = 'Checked Out'
        WHERE id = ?
        AND status = 'Inside'
    `;

    db.query(sql, [visitorId], (err, result) => {

        if (err) {

            console.error("Checkout error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to check out visitor",
                error: err.message
            });

        }


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Visitor not found or already checked out"
            });

        }


        res.json({
            success: true,
            message: "Visitor checked out successfully"
        });

    });

});

router.get("/dashboard/stats", (req, res) => {

    const sql = `
        SELECT

            COUNT(*) AS total_today,

            SUM(
                CASE
                    WHEN status = 'Inside'
                    THEN 1
                    ELSE 0
                END
            ) AS currently_inside,

            SUM(
                CASE
                    WHEN status = 'Checked Out'
                    THEN 1
                    ELSE 0
                END
            ) AS checked_out

        FROM visitors

        WHERE visit_date = CURDATE()
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Dashboard stats error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard statistics",
                error: err.message
            });

        }


        const stats = results[0];


        res.json({

            success: true,

            stats: {

                totalToday: Number(
                    stats.total_today || 0
                ),

                currentlyInside: Number(
                    stats.currently_inside || 0
                ),

                checkedOut: Number(
                    stats.checked_out || 0
                )

            }

        });

    });

});

router.get("/dashboard/today", (req, res) => {

    const sql = `
       SELECT
            v.id,
            v.visitor_name,
            v.mobile,
            v.company_name,
            v.person_to_meet,
            v.purpose,
            v.in_time,
            v.out_time,
            v.status,
            v.created_by,
            u.full_name AS created_by_name
        FROM visitors v
        LEFT JOIN users u
            ON v.created_by = u.id
                WHERE visit_date = CURDATE()

                ORDER BY in_time DESC
            `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Today's visitors error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch today's visitors",
                error: err.message
            });

        }


        res.json({

            success: true,

            visitors: results

        });

    });

});


module.exports = router;