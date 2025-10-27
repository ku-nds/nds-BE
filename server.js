import express from 'express';
import festivalRoutes from './routes/festivalRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/festivals', festivalRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
