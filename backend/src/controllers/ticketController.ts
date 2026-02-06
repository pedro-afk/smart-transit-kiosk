import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { TicketType } from '../generated/prisma/client';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { type }: { type: TicketType } = req.body;

    if (!type || !Object.values(TicketType).includes(type)) {
      return res.status(400).json({ error: 'Invalid ticket type' });
    }

    // Calculate validUntil based on type
    const validUntil = new Date();
    if (type === TicketType.SINGLE) {
      validUntil.setHours(validUntil.getHours() + 2); // Valid for 2 hours
    } else if (type === TicketType.DAY_PASS) {
      validUntil.setDate(validUntil.getDate() + 1); // Valid for 1 day
    }

    // Generate QR code (simple for now)
    const qrCode = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const ticket = await prisma.ticket.create({
      data: {
        type,
        validUntil,
        qrCode,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};