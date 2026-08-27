import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'node:path';
import { prisma } from './db/prisma';
import { financieroRouter } from './nucleo-financiero/financiero.routes';
import { gruposRouter } from './grupos-familiares/grupos.routes';
import { hogarRouter } from './hogar/hogar.routes';
import { identidadRouter } from './identidad/identidad.routes';
import { insightsRouter } from './insights/insights.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health/db', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use('/api', identidadRouter);
app.use('/api', gruposRouter);
app.use('/api', financieroRouter);
app.use('/api', hogarRouter);
app.use('/api', insightsRouter);

// Sirve el frontend ya compilado (mismo origen -> la cookie de sesion
// funciona sin configuracion adicional de CORS entre sitios).
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`FamilyFinance backend escuchando en :${port}`);
});
