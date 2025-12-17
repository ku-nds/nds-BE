import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import festivalRoutes from './routes/festivalRoutes.js';

const app = express();

app.use(cors({ origin: '*' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use('/api/festivals', festivalRoutes);

app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err?.status || 500).json({ message: err?.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;