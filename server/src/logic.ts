import { randomUUID } from 'crypto';
import { query } from './db';
import { CalculationNode, OperationType, User } from './types';

export async function createUser(username: string, passwordHash: string): Promise<User> {
  const id = randomUUID();
  const role: 'user' = 'user';
  const createdAt = new Date().toISOString();

  await query(
    `INSERT INTO users (id, username, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, username, passwordHash, role, createdAt],
  );

  return { id, username, passwordHash, role, createdAt };
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const result = await query<User & { password_hash: string; created_at: string }>(
    `SELECT id, username, password_hash, role, created_at
     FROM users WHERE username = $1`,
    [username],
  );
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    username: row.username,
    passwordHash: (row as any).password_hash,
    role: row.role,
    createdAt: (row as any).created_at,
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await query<User & { password_hash: string; created_at: string }>(
    `SELECT id, username, password_hash, role, created_at
     FROM users WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: row.id,
    username: row.username,
    passwordHash: (row as any).password_hash,
    role: row.role,
    createdAt: (row as any).created_at,
  };
}

export async function createRootNode(value: number, userId: string): Promise<CalculationNode> {
  const id = randomUUID();
  const rootId = id;
  const createdAt = new Date().toISOString();

  await query(
    `INSERT INTO calculation_nodes
      (id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, rootId, null, value, null, null, value, userId, createdAt],
  );

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

export async function getNodeById(id: string): Promise<CalculationNode | undefined> {
  const result = await query<any>(
    `SELECT id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at
     FROM calculation_nodes WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) return undefined;
  return mapRowToNode(row);
}

export async function createChildNode(
  parent: CalculationNode,
  op: OperationType,
  rightValue: number,
  userId: string,
): Promise<CalculationNode> {
  const left = parent.result;
  let resultValue: number;
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
      if (rightValue === 0) throw new Error('Division by zero');
      resultValue = left / rightValue;
      break;
    default:
      throw new Error('Unknown operation');
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  await query(
    `INSERT INTO calculation_nodes
      (id, root_id, parent_id, left_value, op, right_value, result, created_by, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, parent.rootId, parent.id, left, op, rightValue, resultValue, userId, createdAt],
  );

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

export async function getAllNodesWithUsers() {
  const result = await query<any>(
    `SELECT
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
     ORDER BY n.created_at ASC`,
  );

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

export function mapRowToNode(row: any): CalculationNode {
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