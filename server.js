import express from 'express';
import cors from 'cors';
import festivalRoutes from './routes/festivalRoutes.js';

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use('/api/festivals', festivalRoutes);

app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err?.status || 500).json({ message: err?.message || 'Internal Server Error' });
});

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;