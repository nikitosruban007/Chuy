import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "chuy_secret_key",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chuy"
});

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    connection.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
        done(err, rows[0]);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
            const user = results[0];
            if (!user.google_id) {
                connection.query("UPDATE users SET google_id = ? WHERE id = ?", [googleId, user.id]);
            }
            return done(null, user);
        } else {
            const insert = "INSERT INTO users (username, email, name, google_id, reg_date) VALUES (?, ?, ?, ?, ?)";
            connection.query(insert, [name, email, name, googleId, new Date()], (e2, res2) => {
                if (e2) return done(e2);
                connection.query("SELECT * FROM users WHERE id = ?", [res2.insertId], (e3, userRows) => {
                    if (e3) return done(e3);
                    done(null, userRows[0]);
                });
            });
        }
    });
}));

app.get("/", (req, res) => res.redirect("/index.html"));

app.post("/register", (req, res) => {
    const { name, username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).send("Будь ласка, заповніть усі поля.");

    connection.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, results) => {
        if (err) return res.status(500).send("Database error");
        if (results.length > 0) return res.send("Користувач уже існує.");

        const q = "INSERT INTO users (username, password, name, email, reg_date) VALUES (?, ?, ?, ?, ?)";
        connection.query(q, [username, password, name, email, new Date()], (e) => {
            if (e) res.status(500).send("Помилка реєстрації");
            else res.send("Реєстрація успішна!");
        });
    });
});

app.post("/login", (req, res) => {
    const { usermail, password } = req.body;
    if (!usermail || !password) return res.status(400).send("Введіть email/username та пароль.");

    const q = `
        SELECT * FROM users
        WHERE (username = ? AND password = ?)
           OR (email = ? AND password = ?)
        LIMIT 1
    `;
    connection.query(q, [usermail, password, usermail, password], (error, results) => {
        if (error) return res.status(500).send("Помилка входу");
        if (results.length > 0) {
            req.session.user = results[0];
            res.send("Вхід успішний!");
        } else res.status(401).send("Невірний логін або пароль.");
    });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login-failed" }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect("/index.html");
    }
);

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login-failed" }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect("/index.html");
    }
);

app.get("/link/google", (req, res, next) => {
    if (!req.session.user) return res.redirect("/");
    passport.authenticate("google", { scope: ["profile", "email"], state: req.session.user.id })(req, res, next);
});

app.get("/link/facebook", (req, res, next) => {
    if (!req.session.user) return res.redirect("/");
    passport.authenticate("facebook", { scope: ["email"], state: req.session.user.id })(req, res, next);
});

app.get("/me", (req, res) => {
    if (req.session.user || req.isAuthenticated()) {
        res.json(req.session.user || req.user);
    } else res.status(401).send("Користувач не авторизований.");
});

app.get("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect("/");
    });
});

app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
