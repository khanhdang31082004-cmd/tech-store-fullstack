require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
    try {
        console.log("Đang kết nối...");
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("✅ Kết nối thành công!");
        await conn.end();
    } catch (err) {
        console.error(err);
    }
})();