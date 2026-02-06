import request from 'supertest';
import app from '../src/config/api';
import { TicketType } from '../src/generated/prisma/client';

// Mock the prisma client
jest.mock('../src/config/db', () => ({
  prisma: {
    ticket: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '../src/config/db';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Ticket Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tickets', () => {
    it('should create a single ticket', async () => {
      const mockTicket = {
        id: '123',
        type: TicketType.SINGLE,
        status: 'ACTIVE',
        qrCode: 'TICKET-123',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

      const response = await request(app)
        .post('/api/tickets')
        .send({ type: TicketType.SINGLE })
        .expect(201);

      expect(response.body).toHaveProperty('id', '123');
      expect(response.body).toHaveProperty('type', TicketType.SINGLE);
      expect(response.body).toHaveProperty('status', 'ACTIVE');
      expect(response.body).toHaveProperty('qrCode', 'TICKET-123');
      expect(response.body).toHaveProperty('validUntil');
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: TicketType.SINGLE,
          qrCode: expect.any(String),
          validUntil: expect.any(Date),
        }),
      });
    });

    it('should create a day pass ticket', async () => {
      const mockTicket = {
        id: '456',
        type: TicketType.DAY_PASS,
        status: 'ACTIVE',
        qrCode: 'TICKET-456',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

      const response = await request(app)
        .post('/api/tickets')
        .send({ type: TicketType.DAY_PASS })
        .expect(201);

      expect(response.body).toHaveProperty('id', '456');
      expect(response.body).toHaveProperty('type', TicketType.DAY_PASS);
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: TicketType.DAY_PASS,
          qrCode: expect.any(String),
          validUntil: expect.any(Date),
        }),
      });
    });

    it('should return 400 for invalid type', async () => {
      await request(app)
        .post('/api/tickets')
        .send({ type: 'INVALID' })
        .expect(400);
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return ticket if found', async () => {
      const mockTicket = {
        id: '123',
        type: TicketType.SINGLE,
        status: 'ACTIVE',
        qrCode: 'TICKET-123',
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(mockTicket);

      const response = await request(app)
        .get('/api/tickets/123')
        .expect(200);

      expect(response.body).toHaveProperty('id', '123');
      expect(response.body).toHaveProperty('type', TicketType.SINGLE);
      expect(response.body).toHaveProperty('status', 'ACTIVE');
      expect(response.body).toHaveProperty('qrCode', 'TICKET-123');
      expect(response.body).toHaveProperty('validUntil');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return 404 for non-existent ticket', async () => {
      (mockPrisma.ticket.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/tickets/non-existent-id')
        .expect(404);

      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });
});