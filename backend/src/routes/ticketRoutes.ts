import { Router } from 'express';
import { createTicket, getTicket } from '../controllers/ticketController';

const router = Router();

router.post('/tickets', createTicket);
router.get('/tickets/:id', getTicket);

export default router;