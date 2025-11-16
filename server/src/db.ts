import { Pool } from 'pg';

const DEFAULT_URL =
    'postgres://avnadmin:AVNS_PslhoX5KsMHd9sjkBHS@pg-1774ef03-project-5403.k.aivencloud.com:18151/defaultdb';

const connectionString = process.env.DATABASE_URL || DEFAULT_URL;

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Using default Aiven connection string in db.ts');
} else {
    console.log('Using DATABASE_URL from environment');
}

export const pool = new Pool({
    connectionString,
    ssl: {
        // ✅ This bypasses the self-signed cert error
        rejectUnauthorized: false,
    },
});

export async function query<T = any>(
    text: string,
    params?: any[],
): Promise<{ rows: T[] }> {
    return pool.query(text, params);
}
