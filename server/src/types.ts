export type Role = 'guest' | 'user';
export type OperationType = 'add' | 'sub' | 'mul' | 'div';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface CalculationNode {
  id: string;
  rootId: string;
  parentId: string | null;
  leftValue: number;
  op: OperationType | null;
  rightValue: number | null;
  result: number;
  createdBy: string;
  createdAt: string;
}