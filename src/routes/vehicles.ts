import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { vehicles, categories } from '../db/schema';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(vehicles).all();
  return c.json({ success: true, data: result });
});

router.get('/search', async (c) => {
  const db = drizzle(c.env.DB);
  const { license_plate, type_category } = c.req.query();
  
  let query = db.select().from(vehicles).leftJoin(categories, eq(vehicles.id_category, categories.id));
  const results = await query.all();
  
  let filtered = results;
  if (license_plate) {
    filtered = filtered.filter(r => r.vehicles.license_plate.includes(license_plate));
  }
  if (type_category) {
    filtered = filtered.filter(r => r.categories?.type === type_category);
  }
  
  return c.json({ success: true, data: filtered.map(f => f.vehicles) });
});

router.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).get();
  if (!result) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, data: result });
});

router.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const result = await db.insert(vehicles).values(body).returning().get();
  return c.json({ success: true, data: result });
});

router.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await db.update(vehicles).set(body).where(eq(vehicles.id, id)).returning().get();
  return c.json({ success: true, data: result });
});

router.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  await db.delete(vehicles).where(eq(vehicles.id, id)).run();
  return c.json({ success: true, message: 'Deleted' });
});

export default router;
