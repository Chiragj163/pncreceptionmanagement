const bcrypt = require("bcryptjs");
const db = require("./db");
const username = "admin";
const password = "admin123";
const fullName = "System Administrator";
const role = "Admin";


async function createAdmin() {

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
                fullName,
                role
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Failed to create admin:",
                        err.message
                    );

                    process.exit(1);

                }

                console.log(
                    "Admin user created successfully."
                );

                console.log(
                    "Username: admin"
                );

                console.log(
                    "Password: admin123"
                );

                process.exit(0);

            }
        );
    } catch (error) {

        console.error(error);
        process.exit(1);

    }
}

createAdmin();