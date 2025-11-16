"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.authMiddleware = authMiddleware;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logic_1 = require("./logic");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function signToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '1d' });
}
async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }
    const token = auth.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await (0, logic_1.getUserById)(payload.sub);
        if (!user)
            return res.status(401).json({ error: 'Invalid token' });
        req.user = user;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
router.post('/register', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
    }
    const existing = await (0, logic_1.findUserByUsername)(username);
    if (existing) {
        return res.status(409).json({ error: 'username already exists' });
    }
    const hash = await bcryptjs_1.default.hash(password, 10);
    const user = await (0, logic_1.createUser)(username, hash);
    const token = signToken(user);
    res.status(201).json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
    });
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    const user = username && (await (0, logic_1.findUserByUsername)(username));
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
    });
});
exports.default = router;
