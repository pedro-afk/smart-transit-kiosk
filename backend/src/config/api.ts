import express from 'express';
import ticketRoutes from '../routes/ticketRoutes';
import purchaseRoutes from '../routes/purchaseRoutes';

const app = express();

app.use(express.json());

app.use('/api', ticketRoutes);
app.use('/api', purchaseRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default app;