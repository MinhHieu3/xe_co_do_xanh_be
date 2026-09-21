import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { categories } from '../db/schema';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(categories).all();
  return c.json({ success: true, data: result });
});

router.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const result = await db.select().from(categories).where(eq(categories.id, id)).get();
  if (!result) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, data: result });
});

router.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const result = await db.insert(categories).values(body).returning().get();
  return c.json({ success: true, data: result });
});

router.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await db.update(categories).set(body).where(eq(categories.id, id)).returning().get();
  return c.json({ success: true, data: result });
});

router.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  await db.delete(categories).where(eq(categories.id, id)).run();
  return c.json({ success: true, message: 'Deleted' });
});

export default router;
