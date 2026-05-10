const fs = require("fs");
const path = require("path");
const db = require("../config/db");

const schemaPath = path.join(__dirname, "schema");

const files = fs.readdirSync(schemaPath);

files.forEach((file) => {
    const sql = fs.readFileSync(path.join(schemaPath, file), "utf8");
    db.exec(sql);
});

console.log("Database initialized");