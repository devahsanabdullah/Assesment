export type OperationType = 'add' | 'sub' | 'mul' | 'div';

export interface User {
  id: string;
  username: string;
  role: 'user' | 'guest';
}

export interface TreeNode {
  id: string;
  rootId: string;
  parentId: string | null;
  leftValue: number;
  op: OperationType | null;
  rightValue: number | null;
  result: number;
  createdBy: { id: string; username: string } | null;
  createdAt: string;
}