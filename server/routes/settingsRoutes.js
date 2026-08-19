require("dotenv").config();
const express = require("express");
const { execFile } = require("child_process");
const router = express.Router();

router.get("/backup", (req, res) => {

    const dbName =
        process.env.DB_NAME;

    const dbUser =
        process.env.DB_USER;

    const dbHost =
        process.env.DB_HOST || "localhost";

    const dbPassword =
        process.env.DB_PASSWORD || "";


    if (!dbName || !dbUser) {

        return res.status(500).json({

            success: false,

            message:
                "Database configuration is incomplete"

        });

    }


    const args = [
        "-h",
        dbHost,

        "-u",
        dbUser
    ];


    if (dbPassword) {

        args.push(
            `-p${dbPassword}`
        );

    }


    args.push(dbName);


    const backupProcess =
        execFile(
            "mysqldump",
            args,
            {
                maxBuffer:
                    50 * 1024 * 1024
            },
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "Backup error:",
                        error
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Database backup failed",

                        error:
                            stderr ||
                            error.message

                    });

                }

            }
        );


    res.setHeader(
        "Content-Type",
        "application/sql"
    );


    res.setHeader(
        "Content-Disposition",
        `attachment; filename="reception_backup_${new Date()
            .toISOString()
            .slice(0, 10)}.sql"`
    );


    backupProcess.stdout.pipe(res);

});


module.exports = router;