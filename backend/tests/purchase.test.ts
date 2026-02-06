import request from 'supertest';
import app from '../src/config/api';
import { TicketType, PaymentMethod } from '../src/generated/prisma/client';

// Mock the prisma client
jest.mock('../src/config/db', () => ({
  prisma: {
    ticket: {
      create: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '../src/config/db';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Purchase Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/purchases', () => {
    it('should create a purchase with single ticket', async () => {
      const mockTicket = {
        id: '789',
        type: TicketType.SINGLE,
        status: 'ACTIVE',
        qrCode: 'TICKET-789',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPurchase = {
        id: 'purchase-123',
        buyerName: 'John Doe',
        buyerEmail: 'john@example.com',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 2.5,
        ticketId: '789',
        ticket: mockTicket,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });

      (mockPrisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);
      (mockPrisma.purchase.create as jest.Mock).mockResolvedValue(mockPurchase);

      const response = await request(app)
        .post('/api/purchases')
        .send({
          type: TicketType.SINGLE,
          buyerName: 'John Doe',
          buyerEmail: 'john@example.com',
          paymentMethod: PaymentMethod.CREDIT_CARD,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id', 'purchase-123');
      expect(response.body).toHaveProperty('buyerName', 'John Doe');
      expect(response.body).toHaveProperty('buyerEmail', 'john@example.com');
      expect(response.body).toHaveProperty('paymentMethod', PaymentMethod.CREDIT_CARD);
      expect(response.body).toHaveProperty('amount', 2.5);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket).toHaveProperty('id', '789');
      expect(response.body.ticket).toHaveProperty('type', TicketType.SINGLE);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: TicketType.SINGLE,
          qrCode: expect.any(String),
          validUntil: expect.any(Date),
        }),
      });
      expect(mockPrisma.purchase.create).toHaveBeenCalledWith({
        data: {
          buyerName: 'John Doe',
          buyerEmail: 'john@example.com',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          amount: 2.5,
          ticketId: '789',
        },
        include: { ticket: true },
      });
    });

    it('should create a purchase with day pass ticket', async () => {
      const mockTicket = {
        id: '101112',
        type: TicketType.DAY_PASS,
        status: 'ACTIVE',
        qrCode: 'TICKET-101112',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPurchase = {
        id: 'purchase-456',
        buyerName: 'Jane Smith',
        buyerEmail: 'jane@example.com',
        paymentMethod: PaymentMethod.DEBIT_CARD,
        amount: 5.0,
        ticketId: '101112',
        ticket: mockTicket,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });

      (mockPrisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);
      (mockPrisma.purchase.create as jest.Mock).mockResolvedValue(mockPurchase);

      const response = await request(app)
        .post('/api/purchases')
        .send({
          type: TicketType.DAY_PASS,
          buyerName: 'Jane Smith',
          buyerEmail: 'jane@example.com',
          paymentMethod: PaymentMethod.DEBIT_CARD,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id', 'purchase-456');
      expect(response.body).toHaveProperty('buyerName', 'Jane Smith');
      expect(response.body).toHaveProperty('buyerEmail', 'jane@example.com');
      expect(response.body).toHaveProperty('paymentMethod', PaymentMethod.DEBIT_CARD);
      expect(response.body).toHaveProperty('amount', 5.0);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket).toHaveProperty('id', '101112');
      expect(response.body.ticket).toHaveProperty('type', TicketType.DAY_PASS);
    });

    it('should return 400 for invalid ticket type', async () => {
      await request(app)
        .post('/api/purchases')
        .send({
          type: 'INVALID',
          buyerName: 'John Doe',
          buyerEmail: 'john@example.com',
          paymentMethod: PaymentMethod.CREDIT_CARD,
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app)
        .post('/api/purchases')
        .send({
          type: TicketType.SINGLE,
          buyerName: 'John Doe',
          // missing buyerEmail and paymentMethod
        })
        .expect(400);
    });
  });

  describe('GET /api/purchases/:id', () => {
    it('should return purchase if found', async () => {
      const mockTicket = {
        id: '789',
        type: TicketType.SINGLE,
        status: 'ACTIVE',
        qrCode: 'TICKET-789',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPurchase = {
        id: 'purchase-123',
        buyerName: 'John Doe',
        buyerEmail: 'john@example.com',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 2.5,
        ticketId: '789',
        ticket: mockTicket,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.purchase.findUnique as jest.Mock).mockResolvedValue(mockPurchase);

      const response = await request(app)
        .get('/api/purchases/purchase-123')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'purchase-123');
      expect(response.body).toHaveProperty('buyerName', 'John Doe');
      expect(response.body).toHaveProperty('buyerEmail', 'john@example.com');
      expect(response.body).toHaveProperty('paymentMethod', PaymentMethod.CREDIT_CARD);
      expect(response.body).toHaveProperty('amount', 2.5);
      expect(response.body).toHaveProperty('ticket');
      expect(response.body.ticket).toHaveProperty('id', '789');
      expect(mockPrisma.purchase.findUnique).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        include: { ticket: true },
      });
    });

    it('should return 404 for non-existent purchase', async () => {
      (mockPrisma.purchase.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/purchases/non-existent-id')
        .expect(404);

      expect(mockPrisma.purchase.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        include: { ticket: true },
      });
    });
  });
});