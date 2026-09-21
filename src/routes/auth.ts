import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import type { Env } from '../index';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  const envUsername = c.env.ADMIN_USERNAME || 'admin';
  const envPassword = c.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = c.env.JWT_SECRET || 'super-secret';

  if (username === envUsername && password === envPassword) {
    const payload = {
      username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, jwtSecret);
    return c.json({ success: true, token, expires_in: '24h' });
  }

  return c.json({ success: false, message: 'Invalid credentials' }, 401);
});

export default auth;
