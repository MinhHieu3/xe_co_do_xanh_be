import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { rentals } from '../db/schema';
import ExcelJS from 'exceljs';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/revenue', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(rentals).all();
  
  const paidRentals = result.filter(r => r.payment === true);
  const totalRevenue = paidRentals.reduce((sum, rental) => sum + (rental.amount || 0), 0);
  
  return c.json({
    success: true,
    data: {
      total_revenue: totalRevenue,
      total_rentals: paidRentals.length,
    }
  });
});

router.get('/details', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(rentals).all();
  const paidRentals = result.filter(r => r.payment === true);

  return c.json({
    success: true,
    data: paidRentals,
    pagination: { current_page: 1, total_pages: 1, total_records: paidRentals.length }
  });
});

router.get('/export-excel', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(rentals).all();
  const paidRentals = result.filter(r => r.payment === true);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bao Cao');
  
  sheet.columns = [
    { header: 'Mã Hợp Đồng', key: 'id', width: 15 },
    { header: 'Mã Đơn Hàng', key: 'id_order', width: 15 },
    { header: 'Mã Các Xe', key: 'vehicles', width: 30 },
    { header: 'Thời Gian Thanh Toán', key: 'time_payment', width: 25 },
  ];

  paidRentals.forEach(r => {
    sheet.addRow({
      id: r.id,
      id_order: r.id_order,
      vehicles: JSON.stringify(r.vehicle_ids),
      time_payment: r.time_payment,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  c.header('Content-Disposition', 'attachment; filename="BaoCao.xlsx"');
  return c.body(buffer as any);
});

export default router;
