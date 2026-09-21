import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import auth from './routes/auth';
import categories from './routes/categories';
import vehicles from './routes/vehicles';
import orders from './routes/orders';
import statistics from './routes/statistics';

export type Env = {
  DB: D1Database;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  JWT_SECRET?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// Apply JWT middleware to protected routes
app.use('/api/*', async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;

  // Public routes that don't need auth
  if (path === '/api/auth/login') {
    return next();
  }
  if (path === '/api/orders' && method === 'POST') {
    return next();
  }
  if (path.startsWith('/api/vehicles') && method === 'GET') {
    return next();
  }

  const jwtSecret = c.env.JWT_SECRET || 'super-secret';
  const jwtMiddleware = jwt({ secret: jwtSecret, alg: 'HS256' });
  return jwtMiddleware(c, next);
});

// Mount routes
app.route('/api/auth', auth);
app.route('/api/categories', categories);
app.route('/api/vehicles', vehicles);
app.route('/api/orders', orders);
app.route('/api/statistics', statistics);

app.get('/', (c) => c.json({ message: 'Co Do Xanh API - Cloudflare Workers & Hono' }));

export default app;
