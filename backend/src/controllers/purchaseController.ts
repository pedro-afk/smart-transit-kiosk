import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { TicketType, PaymentMethod } from '../generated/prisma/client';

export const purchaseTicket = async (req: Request, res: Response) => {
  try {
    const { type, buyerName, buyerEmail, buyerPhone, paymentMethod }: {
      type: TicketType;
      buyerName: string;
      buyerEmail: string;
      buyerPhone?: string;
      paymentMethod: PaymentMethod;
    } = req.body;

    if (!type || !Object.values(TicketType).includes(type)) {
      return res.status(400).json({ error: 'Invalid ticket type' });
    }

    if (!buyerName || !buyerEmail || !paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
      return res.status(400).json({ error: 'Missing or invalid buyer/payment information' });
    }

    // Calculate amount based on ticket type
    const amount = type === TicketType.SINGLE ? 2.5 : 5.0;

    // Calculate validUntil based on type
    const validUntil = new Date();
    if (type === TicketType.SINGLE) {
      validUntil.setHours(validUntil.getHours() + 2);
    } else if (type === TicketType.DAY_PASS) {
      validUntil.setDate(validUntil.getDate() + 1);
    }

    // Generate QR code
    const qrCode = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create ticket and purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          type,
          validUntil,
          qrCode,
        },
      });

      const purchase = await tx.purchase.create({
        data: {
          ticketId: ticket.id,
          buyerName,
          buyerEmail,
          buyerPhone,
          paymentMethod,
          amount,
        },
        include: { ticket: true },
      });

      return purchase;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { ticket: true },
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPurchasesByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const purchases = await prisma.purchase.findMany({
      where: { buyerEmail: { equals: email, mode: 'insensitive' } },
      include: { ticket: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(purchases);
  } catch (error) {
    console.error('Error getting purchases by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
