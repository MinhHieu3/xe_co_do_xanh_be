import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { incomes } from '../db/schema';
import { desc } from 'drizzle-orm';
import ExcelJS from 'exceljs';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/revenue', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(incomes).all();
  
  const totalRevenue = result.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  
  return c.json({
    success: true,
    data: {
      total_revenue: totalRevenue,
      total_rentals: result.length,
    }
  });
});

router.get('/details', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(incomes).orderBy(desc(incomes.id)).all();

  return c.json({
    success: true,
    data: result,
    pagination: { current_page: 1, total_pages: 1, total_records: result.length }
  });
});

router.get('/export-excel', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(incomes).orderBy(desc(incomes.id)).all();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bao Cao');
  
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Số Tiền', key: 'amount', width: 20 },
    { header: 'Thời Gian', key: 'date', width: 30 },
  ];

  result.forEach(r => {
    sheet.addRow({
      id: r.id,
      amount: r.amount,
      date: r.date,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  c.header('Content-Disposition', 'attachment; filename="BaoCaoThuNhap.xlsx"');
  return c.body(buffer as any);
});

export default router;
