import axios, { type AxiosStatic } from 'axios'
import { purchaseTicket, type PurchaseForm, API_BASE_URL } from './services/ticketService'
import { beforeEach, describe, expect, test, vi, type Mocked } from 'vitest'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))
const mockedAxios = axios as Mocked<AxiosStatic>

describe('purchaseTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should call axios.post with correct data and return purchase', async () => {
    const form: PurchaseForm = {
      type: 'SINGLE',
      buyerName: 'Ana Silva',
      buyerEmail: 'ana@email.com',
      buyerPhone: '11999990000',
      paymentMethod: 'CREDIT_CARD'
    }
    const mockPurchase = {
      id: 'purchase-123',
      ticketId: 'ticket-123',
      buyerName: 'Ana Silva',
      buyerEmail: 'ana@email.com',
      buyerPhone: '11999990000',
      paymentMethod: 'CREDIT_CARD',
      amount: 2.5,
      createdAt: '2026-02-07T10:00:00.000Z',
      ticket: {
        id: 'ticket-123',
        type: 'SINGLE',
        status: 'ACTIVE',
        validUntil: '2026-02-07T12:00:00.000Z',
        qrCode: 'TICKET-123',
        createdAt: '2026-02-07T10:00:00.000Z',
        updatedAt: '2026-02-07T10:00:00.000Z'
      }
    }
    mockedAxios.post.mockResolvedValueOnce({ data: mockPurchase })

    const result = await purchaseTicket(form)

    expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/api/purchases`, form)
    expect(result).toEqual(mockPurchase)
  })

  test('should throw error when axios.post fails', async () => {
    const form: PurchaseForm = {
      type: 'DAY_PASS',
      buyerName: 'Joao Souza',
      buyerEmail: 'joao@email.com',
      paymentMethod: 'CASH'
    }
    const errorMessage = 'Network Error'
    mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

    await expect(purchaseTicket(form)).rejects.toThrow(errorMessage)
  })

  test('should handle different form data', async () => {
    const form: PurchaseForm = {
      type: 'DAY_PASS',
      buyerName: 'Maria Lima',
      buyerEmail: 'maria@email.com',
      paymentMethod: 'DEBIT_CARD'
    }
    const mockPurchase = {
      id: 'purchase-456',
      ticketId: 'ticket-456',
      buyerName: 'Maria Lima',
      buyerEmail: 'maria@email.com',
      buyerPhone: null,
      paymentMethod: 'DEBIT_CARD',
      amount: 5.0,
      createdAt: '2026-02-07T11:00:00.000Z',
      ticket: {
        id: 'ticket-456',
        type: 'DAY_PASS',
        status: 'ACTIVE',
        validUntil: '2026-02-08T11:00:00.000Z',
        qrCode: 'TICKET-456',
        createdAt: '2026-02-07T11:00:00.000Z',
        updatedAt: '2026-02-07T11:00:00.000Z'
      }
    }
    mockedAxios.post.mockResolvedValueOnce({ data: mockPurchase })

    const result = await purchaseTicket(form)

    expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/api/purchases`, form)
    expect(result).toEqual(mockPurchase)
  })
})
