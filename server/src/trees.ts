import { Router } from 'express';
import { authMiddleware, AuthRequest } from './auth';
import { getAllNodesWithUsers, getNodeById, createChildNode, createRootNode } from './logic';
import { OperationType } from './types';

const router = Router();

router.get('/', async (_req, res) => {
  const nodes = await getAllNodesWithUsers();
  res.json(nodes);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { value } = req.body ?? {};
  if (typeof value !== 'number') {
    return res.status(400).json({ error: 'value must be number' });
  }
  const node = await createRootNode(value, req.user!.id);
  const nodes = await getAllNodesWithUsers();
  const dto = nodes.find((n) => n.id === node.id);
  res.status(201).json({ node: dto });
});

router.post('/:parentId/operations', authMiddleware, async (req: AuthRequest, res) => {
  const { parentId } = req.params;
  const { op, rightValue } = req.body ?? {};
  if (!['add', 'sub', 'mul', 'div'].includes(op)) {
    return res.status(400).json({ error: 'invalid op' });
  }
  if (typeof rightValue !== 'number') {
    return res.status(400).json({ error: 'rightValue must be number' });
  }

  const parent = await getNodeById(parentId);
  if (!parent) return res.status(404).json({ error: 'parent not found' });

  try {
    const node = await createChildNode(parent, op as OperationType, rightValue, req.user!.id);
    const nodes = await getAllNodesWithUsers();
    const dto = nodes.find((n) => n.id === node.id);
    res.status(201).json({ node: dto });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'error' });
  }
});

export default router;