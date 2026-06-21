const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'vyapaar_mitra_super_secret_hackathon_key';

// Mock DB
const users = [];

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "User already exists" });
    }
    
    const newUser = { id: Date.now(), username, password, isPremium: false };
    users.push(newUser);
    
    const token = jwt.sign({ id: newUser.id, username: newUser.username, isPremium: newUser.isPremium }, JWT_SECRET);
    res.json({ success: true, token, user: { username, isPremium: false } });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, isPremium: user.isPremium }, JWT_SECRET);
    res.json({ success: true, token, user: { username: user.username, isPremium: user.isPremium } });
});

// Premium upgrade
router.post('/upgrade', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (user) {
            user.isPremium = true;
            const newToken = jwt.sign({ id: user.id, username: user.username, isPremium: true }, JWT_SECRET);
            return res.json({ success: true, message: "Upgraded to Premium!", token: newToken });
        }
        res.status(404).json({ error: "User not found" });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// Middleware for protecting routes
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied. Please login." });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};

module.exports = { router, verifyToken, JWT_SECRET };
