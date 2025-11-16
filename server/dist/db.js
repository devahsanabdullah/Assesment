"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
// src/db.ts
const pg_1 = require("pg");
const DEFAULT_URL = 'postgres://avnadmin:AVNS_PslhoX5KsMHd9sjkBHS@pg-1774ef03-project-5403.k.aivencloud.com:18151/defaultdb';
const connectionString = process.env.DATABASE_URL || DEFAULT_URL;
if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Using default Aiven connection string in db.ts');
}
else {
    console.log('Using DATABASE_URL from environment');
}
exports.pool = new pg_1.Pool({
    connectionString,
    ssl: {
        // for Aiven – dev-safe, you can tighten later with CA
        rejectUnauthorized: false,
    },
});
// @ts-ignore
async function query(text, params) {
    return exports.pool.query(text, params);
}
