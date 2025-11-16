import React, { useState } from 'react';
import { OperationType, TreeNode } from '../types';

interface Props {
  node: TreeNode;
  canReply: boolean;
  onReply: (parentId: string, op: OperationType, rightValue: number) => Promise<void> | void;
  children?: React.ReactNode;
}

export const NodeItem: React.FC<Props> = ({ node, canReply, onReply, children }) => {
  const [showReply, setShowReply] = useState(false);
  const [op, setOp] = useState<OperationType>('add');
  const [right, setRight] = useState('0');

  const label =
    node.op === null
      ? `Start: ${node.result}`
      : `${node.leftValue} ${symbol(node.op)} ${node.rightValue} = ${node.result}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onReply(node.id, op, Number(right));
    setRight('0');
    setShowReply(false);
  };

  return (
    <div style={{ marginLeft: node.parentId ? 24 : 0, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>{label}</strong>
        <span style={{ fontSize: 12, color: '#555' }}>
          by {node.createdBy?.username ?? 'unknown'}
        </span>
        {canReply && (
          <button onClick={() => setShowReply((v) => !v)}>
            {showReply ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {showReply && (
        <form onSubmit={submit} style={{ marginTop: 4 }}>
          <span>{node.result}</span>
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as OperationType)}
            style={{ marginLeft: 4, marginRight: 4 }}
          >
            <option value="add">+</option>
            <option value="sub">-</option>
            <option value="mul">*</option>
            <option value="div">/</option>
          </select>
          <input
            type="number"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            style={{ width: 70, marginRight: 4 }}
          />
          <button type="submit">=</button>
        </form>
      )}

      <div>{children}</div>
    </div>
  );
};

function symbol(op: OperationType): string {
  switch (op) {
    case 'add':
      return '+';
    case 'sub':
      return '-';
    case 'mul':
      return '×';
    case 'div':
      return '÷';
    default:
      return '?';
  }
}