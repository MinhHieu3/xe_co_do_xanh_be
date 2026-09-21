import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, inArray } from 'drizzle-orm';
import { orders, rentals, vehicles } from '../db/schema';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const allOrders = await db.select().from(orders).all();
  const allRentals = await db.select().from(rentals).all();
  const allVehicles = await db.select().from(vehicles).all();

  const data = allOrders.map(order => {
    const rental = allRentals.find(r => r.id_order === order.id);
    let assigned_plates = '';
    if (rental && rental.vehicle_ids) {
      const plates = rental.vehicle_ids.map(vid => {
        const v = allVehicles.find(v => v.id === vid);
        return v ? v.license_plate : '';
      }).filter(Boolean);
      assigned_plates = plates.join(', ');
    }
    return { ...order, assigned_plates };
  });

  return c.json({ success: true, data });
});

router.get('/search', async (c) => {
  const db = drizzle(c.env.DB);
  const { phone } = c.req.query();

  let query: any = db.select().from(orders);
  if (phone) {
    query = db.select().from(orders).where(eq(orders.phone, phone));
  }
  const result = await query.all();
  return c.json({ success: true, data: result });
});

router.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const result = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!result) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, data: result });
});

router.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const result = await db.insert(orders).values(body).returning().get();
  return c.json({ success: true, data: result });
});

router.put('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const result = await db.update(orders).set(body).where(eq(orders.id, id)).returning().get();
  return c.json({ success: true, data: result });
});

router.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));
  await db.delete(orders).where(eq(orders.id, id)).run();
  return c.json({ success: true, message: 'Deleted' });
});

// Business Logic: Assign vehicles to order
router.post('/:id/assign-vehicles', async (c) => {
  const db = drizzle(c.env.DB);
  const id_order = Number(c.req.param('id'));
  const { vehicle_ids, des_1, des_2 } = await c.req.json<{ vehicle_ids: number[], des_1?: string, des_2?: string }>();

  if (!vehicle_ids || vehicle_ids.length === 0) {
    return c.json({ success: false, message: 'vehicle_ids is required' }, 400);
  }

  const rentalResult = await db.insert(rentals).values({
    id_order,
    vehicle_ids,
    payment: false,
    des_1,
    des_2
  }).returning().get();

  await db.update(vehicles).set({ status: true }).where(inArray(vehicles.id, vehicle_ids)).run();

  return c.json({ success: true, message: 'Vehicles assigned', rental: rentalResult });
});

// Business Logic: Checkout and Return vehicles
router.post('/:id/checkout', async (c) => {
  const db = drizzle(c.env.DB);
  const id_order = Number(c.req.param('id'));

  let amount = 0;
  try {
    const body = await c.req.json();
    if (body && body.amount) {
      amount = Number(body.amount) || 0;
    }
  } catch (e) {
    // Ignore JSON parse error if body is empty
  }

  const rental = await db.select().from(rentals).where(eq(rentals.id_order, id_order)).get();

  if (!rental) {
    return c.json({ success: false, message: 'Rental not found for this order' }, 404);
  }

  // Record income
  const { incomes } = await import('../db/schema');
  await db.insert(incomes).values({
    amount,
    date: new Date().toISOString()
  }).run();

  // Unlock vehicles
  if (rental.vehicle_ids && rental.vehicle_ids.length > 0) {
    await db.update(vehicles).set({ status: false }).where(inArray(vehicles.id, rental.vehicle_ids)).run();
  }

  // Delete rental and order
  await db.delete(rentals).where(eq(rentals.id, rental.id)).run();
  await db.delete(orders).where(eq(orders.id, id_order)).run();

  return c.json({ success: true, message: 'Checkout successful' });
});

export default router;
