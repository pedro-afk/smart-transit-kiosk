import { useRef, useState } from 'react'
import { purchaseTicket, type Purchase, type PurchaseForm } from './services/ticketService'

const ticketTypeOptions = [
  { value: 'SINGLE', label: 'Single ticket', meta: '2 hours' },
  { value: 'DAY_PASS', label: 'Day pass', meta: '24 hours' }
]

const paymentMethodOptions = [
  { value: 'CREDIT_CARD', label: 'Credit card' },
  { value: 'DEBIT_CARD', label: 'Debit card' },
  { value: 'CASH', label: 'Cash' }
]

const inputBase =
  'h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-900 shadow-sm transition focus:border-rail-blue focus:ring-4 focus:ring-rail-blue/20'

const selectBase = `${inputBase} appearance-none pr-12 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus:-translate-y-0.5 focus:shadow-lg`

const initialForm: PurchaseForm = {
  type: 'SINGLE',
  buyerName: '',
  buyerEmail: '',
  buyerPhone: '',
  paymentMethod: 'CREDIT_CARD'
}

function App() {
  const [form, setForm] = useState<PurchaseForm>(initialForm)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'tap' | 'processing' | 'approved' | 'failed'
  >('idle')
  const paymentCancelledRef = useRef(false)

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const simulateContactlessPayment = async () => {
    paymentCancelledRef.current = false
    setShowPaymentModal(true)
    setPaymentStatus('tap')
    await delay(1600)
    if (paymentCancelledRef.current) {
      return false
    }
    setPaymentStatus('processing')
    await delay(1400)
    if (paymentCancelledRef.current) {
      return false
    }
    setPaymentStatus('approved')
    return true
  }

  const cancelPayment = () => {
    paymentCancelledRef.current = true
    setPaymentStatus('idle')
    setShowPaymentModal(false)
  }

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelectChange = <K extends keyof PurchaseForm>(field: K, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as PurchaseForm[K] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPurchase(null)
    try {
      const paymentApproved = await simulateContactlessPayment()
      if (!paymentApproved) {
        setLoading(false)
        return
      }
      const payload: PurchaseForm = {
        ...form,
        buyerPhone: form.buyerPhone?.trim() ? form.buyerPhone : undefined
      }
      const newPurchase = await purchaseTicket(payload)
      setPurchase(newPurchase)
      setForm(initialForm)
      await delay(800)
      setShowPaymentModal(false)
      setPaymentStatus('idle')
    } catch (error) {
      setPaymentStatus('failed')
      console.error('Error purchasing ticket:', error)
      alert('Error generating ticket. Please check the backend.')
    } finally {
      setLoading(false)
    }
  }

  const ticketTypeLabel =
    ticketTypeOptions.find((option) => option.value === form.type)?.label ?? 'Single ticket'
  const paymentLabel =
    paymentMethodOptions.find((option) => option.value === form.paymentMethod)?.label ??
    'Credit card'
  const paymentStatusCopy = {
    idle: {
      label: 'Awaiting payment',
      description: 'Tap your card, phone, or watch on the pinpad to continue.'
    },
    tap: {
      label: 'Tap your card',
      description: 'Hold the card on the reader until it confirms.'
    },
    processing: {
      label: 'Processing payment',
      description: 'Please keep your card on the reader.'
    },
    approved: {
      label: 'Payment approved',
      description: 'Generating your ticket now.'
    },
    failed: {
      label: 'Payment declined',
      description: 'Try again or choose another payment method.'
    }
  } as const
  const buttonLabel = loading ? 'Processing payment...' : 'Pay and generate ticket'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10 lg:px-10">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Smart Transit Kiosk</p>
          <h1 className="mt-3 font-display text-4xl text-rail-blue sm:text-5xl">
            Buy Train Ticket
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Generate a ticket quickly and clearly. Enter buyer details and ticket type.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-rail-blue">Buyer details</h2>
                <span className="rounded-full bg-rail-green/10 px-3 py-1 text-xs font-semibold text-rail-green">
                  Station kiosk
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="buyerName">
                    Full name
                  </label>
                  <input
                    id="buyerName"
                    name="buyerName"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={form.buyerName}
                    onChange={handleBuyerChange}
                    className={inputBase}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="buyerEmail">
                    Email
                  </label>
                  <input
                    id="buyerEmail"
                    name="buyerEmail"
                    type="email"
                    placeholder="alex@domain.com"
                    value={form.buyerEmail}
                    onChange={handleBuyerChange}
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="buyerPhone">
                    Phone
                  </label>
                  <input
                    id="buyerPhone"
                    name="buyerPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={form.buyerPhone}
                    onChange={handleBuyerChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="type">
                    Ticket type
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={(e) => handleSelectChange('type', e.target.value)}
                      className={selectBase}
                    >
                      {ticketTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.meta})
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="paymentMethod">
                    Payment method
                  </label>
                  <div className="relative">
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                      className={selectBase}
                    >
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      ▼
                    </span>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-16 w-full rounded-2xl bg-black px-8 text-center text-lg font-semibold text-white shadow-lg transition duration-200 ease-out hover:bg-black/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0.5 active:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white p-8 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-rail-blue">Ticket summary</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Preview
              </span>
            </div>
            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Ticket
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    Type: <span className="font-semibold text-slate-800">{ticketTypeLabel}</span>
                  </p>
                  <p>
                    Payment: <span className="font-semibold text-slate-800">{paymentLabel}</span>
                  </p>
                  <p>
                    Buyer:{' '}
                    <span className="font-semibold text-slate-800">
                      {form.buyerName || 'Not provided'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                {purchase ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-rail-blue">Ticket confirmed</p>
                    <p>Your ticket is being printed at the kiosk.</p>
                    <div className="rounded-lg border border-rail-green/20 bg-rail-green/10 p-3 text-xs font-semibold text-rail-green">
                      A confirmation email will be sent shortly.
                    </div>
                  </div>
                ) : (
                  <p>Complete the payment to generate your ticket.</p>
                )}
              </div>
            </div>
          </aside>
        </form>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Pinpad • Contactless payment
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  paymentStatus === 'approved'
                    ? 'bg-rail-green/10 text-rail-green'
                    : paymentStatus === 'failed'
                      ? 'bg-rose-100 text-rose-700'
                      : paymentStatus === 'processing' || paymentStatus === 'tap'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-600'
                }`}
              >
                {paymentStatusCopy[paymentStatus].label}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {paymentStatusCopy[paymentStatus].description}
            </p>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rail-blue/10 text-rail-blue">
                  NFC
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Keep your card close to the reader
                  </p>
                  <p className="text-xs text-slate-500">
                    Secure payment with automatic confirmation.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="h-2 w-4 rounded-full bg-slate-300" />
                <span className="h-2 w-6 rounded-full bg-slate-300" />
                <span className="text-xs uppercase tracking-[0.2em]">NFC</span>
              </div>
            </div>
            <button
              type="button"
              onClick={cancelPayment}
              disabled={paymentStatus === 'approved'}
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel payment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
