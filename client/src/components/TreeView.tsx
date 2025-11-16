import React from 'react';
import { TreeNode, OperationType } from '../types';
import { NodeItem } from './NodeItem';

interface Props {
  nodes: TreeNode[];
  canReply: boolean;
  onReply: (parentId: string, op: OperationType, rightValue: number) => Promise<void> | void;
}

export const TreeView: React.FC<Props> = ({ nodes, canReply, onReply }) => {
  const byParent: Record<string, TreeNode[]> = {};
  nodes.forEach((n) => {
    const key = n.parentId ?? 'root';
    (byParent[key] ||= []).push(n);
  });

  const renderSubtree = (node: TreeNode): React.ReactNode => {
    const children = byParent[node.id] ?? [];
    return (
      <NodeItem
        key={node.id}
        node={node}
        canReply={canReply}
        onReply={onReply}
      >
        {children.map((c) => renderSubtree(c))}
      </NodeItem>
    );
  };

  const roots = byParent['root'] ?? [];

  return (
    <div style={{ border: '1px solid #ddd', padding: 8, marginTop: 16 }}>
      {roots.map((n) => renderSubtree(n))}
    </div>
  );
};