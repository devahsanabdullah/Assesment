"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("./auth");
const logic_1 = require("./logic");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const nodes = await (0, logic_1.getAllNodesWithUsers)();
    res.json(nodes);
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const { value } = req.body ?? {};
    if (typeof value !== 'number') {
        return res.status(400).json({ error: 'value must be number' });
    }
    const node = await (0, logic_1.createRootNode)(value, req.user.id);
    const nodes = await (0, logic_1.getAllNodesWithUsers)();
    const dto = nodes.find((n) => n.id === node.id);
    res.status(201).json({ node: dto });
});
router.post('/:parentId/operations', auth_1.authMiddleware, async (req, res) => {
    const { parentId } = req.params;
    const { op, rightValue } = req.body ?? {};
    if (!['add', 'sub', 'mul', 'div'].includes(op)) {
        return res.status(400).json({ error: 'invalid op' });
    }
    if (typeof rightValue !== 'number') {
        return res.status(400).json({ error: 'rightValue must be number' });
    }
    const parent = await (0, logic_1.getNodeById)(parentId);
    if (!parent)
        return res.status(404).json({ error: 'parent not found' });
    try {
        const node = await (0, logic_1.createChildNode)(parent, op, rightValue, req.user.id);
        const nodes = await (0, logic_1.getAllNodesWithUsers)();
        const dto = nodes.find((n) => n.id === node.id);
        res.status(201).json({ node: dto });
    }
    catch (e) {
        res.status(400).json({ error: e.message ?? 'error' });
    }
});
exports.default = router;
