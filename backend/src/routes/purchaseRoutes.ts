import { Router } from 'express';
import { purchaseTicket, getPurchase, getPurchasesByEmail } from '../controllers/purchaseController';

const router = Router();

router.post('/purchases', purchaseTicket);
router.get('/purchases', getPurchasesByEmail);
router.get('/purchases/:id', getPurchase);

export default router;
