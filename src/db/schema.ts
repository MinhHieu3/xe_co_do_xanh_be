import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  brand: text('brand').notNull(),
  type: text('type').notNull(),
  date: text('date').notNull(),
});

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  license_plate: text('license_plate').notNull(),
  status: integer('status', { mode: 'boolean' }).notNull().default(false),
  id_category: integer('id_category').references(() => categories.id).notNull(),
  daily_rate: text('daily_rate'),
  monthly_rate: text('monthly_rate'),
  hourly_rate: text('hourly_rate'),
  des_1: text('des_1'),
  des_2: text('des_2'),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  time_start: text('time_start'),
  time_end: text('time_end'),
  status: integer('status', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  cccd: text('cccd'),
  email: text('email'),
  quantity: text('quantity'),
  location: text('location'),
  type_category: text('type_category'),
  des_1: text('des_1'),
  des_2: text('des_2'),
  des_3: text('des_3'),
});

export const rentals = sqliteTable('rentals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicle_ids: text('vehicle_ids', { mode: 'json' }).$type<number[]>(),
  id_order: integer('id_order').references(() => orders.id),
  status: integer('status', { mode: 'boolean' }).notNull().default(false),
  payment: integer('payment', { mode: 'boolean' }).notNull().default(false),
  time_payment: text('time_payment'),
  amount: integer('amount').default(0),
  des_1: text('des_1'),
  des_2: text('des_2'),
  des_3: text('des_3'),
});

export const incomes = sqliteTable('incomes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  date: text('date').notNull(),
});
