const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/authMiddleware");
const normalizeDateTime = (dtStr) => {
    if (!dtStr) return null;
    let clean = dtStr.replace("T", " ").trim();
    if (clean.length === 16) {
        clean += ":00"; // add seconds if missing from datetime-local input
    }
    return clean;
};

router.post("/", authenticateToken, (req, res) => {

    const {
        visitor_name,
        address,
        mobile,
        company_name,
        other_details,
        purpose,
        person_to_meet,
        in_time
    } = req.body;

    if (!visitor_name || !mobile || !purpose || !person_to_meet) {

        return res.status(400).json({
            success: false,
            message: "Please fill all required fields"
        });

    }
    const formattedInTime = normalizeDateTime(in_time);
    const formattedVisitDate = formattedInTime ? formattedInTime.split(" ")[0] : null;


    const sql =  formattedInTime ? `
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Inside', ?)
    ` : `
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


    const values =formattedInTime
     ?[
        visitor_name,
        address || null,
        mobile,
        company_name || null,
        other_details || null,
        purpose,
        person_to_meet,
        in_time,
        in_time,
        req.user.id
    ]
    :[
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
    const { out_time } = req.body;
    const checkSql = "SELECT in_time FROM visitors WHERE id = ? AND status = 'Inside'";
    db.query(checkSql, [visitorId], (checkErr, results) => {
        if (checkErr) {
            console.error("Fetch visitor error:", checkErr);
            return res.status(500).json({ success: false, message: "Database error", error: checkErr.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Visitor not found or already checked out" });
        }

        // const inTime = new Date(results[0].in_time);
        // const checkOutTime = out_time ? new Date(out_time) : new Date();
        const formattedOutTime = normalizeDateTime(out_time);
        const dbInTimeStr = normalizeDateTime(
            typeof results[0].in_time === "string" 
                ? results[0].in_time 
                : new Date(results[0].in_time).toISOString().slice(0, 19).replace("T", " ")
        );

        if (formattedOutTime && formattedOutTime <= dbInTimeStr) {
            return res.status(400).json({
                success: false,
                message: "Check-out time cannot be earlier than or equal to check-in time."
            });
        }

        // if (checkOutTime <= inTime) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Check-out time cannot be earlier than or equal to check-in time."
        //     });
        // }

        const sql = formattedOutTime ? `
            UPDATE visitors
            SET
                out_time = ?,
                status = 'Checked Out'
            WHERE id = ?
            AND status = 'Inside'
        ` : `
            UPDATE visitors
            SET
                out_time = NOW(),
                status = 'Checked Out'
            WHERE id = ?
            AND status = 'Inside'
        `;
        const values = formattedOutTime ? [formattedOutTime, visitorId] : [visitorId];

        db.query(sql, values , (err, result) => {

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