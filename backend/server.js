const path = require("node:path");
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// HOME PAGE
app.get("/", (req, res) => {
    res.send("Hello! SafeHer Backend is Working ❤️");
});

// REAL USER REGISTRATION
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        // Check required information
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Securely hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Save user in database
        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash, mobile)
            VALUES (?, ?, ?, ?)
        `).run(name.trim(), cleanEmail, passwordHash, mobile || null);

        res.status(201).json({
            message: "Registration successful! Welcome to SafeHer ❤️",
            user: {
                id: Number(result.lastInsertRowid),
                name: name.trim(),
                email: cleanEmail,
                mobile: mobile || null
            }
        });

    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
});
// USER LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(cleanEmail);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful! Welcome back to SafeHer ❤️",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong during login."
        });
    }
});
// LOGIN TEST PAGE
app.get("/test-login", (req, res) => {
    res.sendFile(__dirname + "/test-login.html");
});
// REGISTRATION TEST PAGE
app.get("/test-register", (req, res) => {
    res.sendFile(__dirname + "/test-register.html");
});
// START SERVER
app.listen(5000, () => {
    console.log("SafeHer server is running!");
});
