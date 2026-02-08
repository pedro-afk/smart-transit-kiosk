import axios from 'axios'

export type TicketType = 'SINGLE' | 'DAY_PASS'
export type TicketStatus = 'ACTIVE' | 'USED' | 'EXPIRED'
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'

export interface Ticket {
  id: string
  type: TicketType
  status: TicketStatus
  validUntil: string
  qrCode: string
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  id: string
  ticketId: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string | null
  paymentMethod: PaymentMethod
  amount: number
  createdAt: string
  ticket: Ticket
}

export interface PurchaseForm {
  type: TicketType
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  paymentMethod: PaymentMethod
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export { API_BASE_URL }

export const purchaseTicket = async (form: PurchaseForm): Promise<Purchase> => {
  const response = await axios.post(`${API_BASE_URL}/api/purchases`, form)
  return response.data
}
