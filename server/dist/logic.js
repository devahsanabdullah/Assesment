"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByUsername = findUserByUsername;
exports.getUserById = getUserById;
exports.createRootNode = createRootNode;
exports.getNodeById = getNodeById;
exports.createChildNode = createChildNode;
exports.getAllNodesWithUsers = getAllNodesWithUsers;
exports.mapRowToNode = mapRowToNode;
const crypto_1 = require("crypto");
const db_1 = require("./db");
async function createUser(username, passwordHash) {
    const id = (0, crypto_1.randomUUID)();
    const role = 'user';
    const createdAt = new Date().toISOString();
    await (0, db_1.query)(`INSERT INTO users (id, username, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, $5)`, [id, username, passwordHash, role, createdAt]);
    return { id, username, passwordHash, role, createdAt };
}
async function findUserByUsername(username) {
    const result = await (0, db_1.query)(`SELECT id, username, password_hash, role, created_at
     FROM users WHERE username = $1`, [username]);
    const row = result.rows[0];
    if (!row)
        return undefined;
    return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at,
    };
}
async function getUserById(id) {
    const result = await (0, db_1.query)(`SELECT id, username, password_hash, role, created_at
     FROM users WHERE id = $1`, [id]);
    const row = result.rows[0];
    if (!row)
        return undefined;
    return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at,
    };
}
async function createRootNode(value, userId) {
    const id = (0, crypto_1.randomUUID)();
    const rootId = id;
    const createdAt = new Date().toISOString();
    await (0, db_1.query)(`INSERT INTO calculation_nodes
      (id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, rootId, null, value, null, null, value, userId, createdAt]);
    return {
        id,
        rootId,
        parentId: null,
        leftValue: value,
        op: null,
        rightValue: null,
        result: value,
        createdBy: userId,
        createdAt,
    };
}
async function getNodeById(id) {
    const result = await (0, db_1.query)(`SELECT id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at
     FROM calculation_nodes WHERE id = $1`, [id]);
    const row = result.rows[0];
    if (!row)
        return undefined;
    return mapRowToNode(row);
}
async function createChildNode(parent, op, rightValue, userId) {
    const left = parent.result;
    let resultValue;
    switch (op) {
        case 'add':
            resultValue = left + rightValue;
            break;
        case 'sub':
            resultValue = left - rightValue;
            break;
        case 'mul':
            resultValue = left * rightValue;
            break;
        case 'div':
            if (rightValue === 0)
                throw new Error('Division by zero');
            resultValue = left / rightValue;
            break;
        default:
            throw new Error('Unknown operation');
    }
    const id = (0, crypto_1.randomUUID)();
    const createdAt = new Date().toISOString();
    await (0, db_1.query)(`INSERT INTO calculation_nodes
      (id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, parent.rootId, parent.id, left, op, rightValue, resultValue, userId, createdAt]);
    return {
        id,
        rootId: parent.rootId,
        parentId: parent.id,
        leftValue: left,
        op,
        rightValue,
        result: resultValue,
        createdBy: userId,
        createdAt,
    };
}
async function getAllNodesWithUsers() {
    const result = await (0, db_1.query)(`SELECT
       n.id,
       n.root_id,
       n.parent_id,
       n.left_value,
       n.op,
       n.right_value,
       n.result,
       n.created_by,
       n.created_at,
       u.username
     FROM calculation_nodes n
     JOIN users u ON n.created_by = u.id
     ORDER BY n.created_at ASC`);
    return result.rows.map((row) => ({
        id: row.id,
        rootId: row.root_id,
        parentId: row.parent_id,
        leftValue: row.left_value,
        op: row.op,
        rightValue: row.right_value,
        result: row.result,
        createdBy: {
            id: row.created_by,
            username: row.username,
        },
        createdAt: row.created_at,
    }));
}
function mapRowToNode(row) {
    return {
        id: row.id,
        rootId: row.root_id,
        parentId: row.parent_id,
        leftValue: row.left_value,
        op: row.op,
        rightValue: row.right_value,
        result: row.result,
        createdBy: row.created_by,
        createdAt: row.created_at,
    };
}
