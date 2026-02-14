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
  'h-14 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-lg text-slate-900 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)] transition placeholder:text-slate-400 focus:border-rail-blue focus:ring-4 focus:ring-rail-blue/15'

const selectBase = `${inputBase} appearance-none pr-12 bg-white/90 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,23,42,0.55)] focus:-translate-y-0.5 focus:shadow-[0_18px_40px_-22px_rgba(15,23,42,0.55)]`

const cardBase =
  'rounded-[28px] border border-slate-200/80 bg-white/85 p-8 shadow-[0_32px_70px_-50px_rgba(15,23,42,0.7)] backdrop-blur'

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
  const ticketTypeMeta =
    ticketTypeOptions.find((option) => option.value === form.type)?.meta ?? '2 hours'
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
  const paymentTone = {
    idle: 'bg-slate-200 text-slate-600',
    tap: 'bg-amber-100 text-amber-700',
    processing: 'bg-amber-100 text-amber-700',
    approved: 'bg-rail-green/10 text-rail-green',
    failed: 'bg-rose-100 text-rose-700'
  } as const
  const paymentProgress = {
    idle: 15,
    tap: 35,
    processing: 70,
    approved: 100,
    failed: 45
  } as const
  const buttonLabel = loading ? 'Processing payment...' : 'Pay and generate ticket'

  return (
    <div className="relative min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-rail-blue/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:px-10">
        <header className="mb-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
            <span className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold shadow-sm ring-1 ring-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-rail-green" />
              Station online
            </span>
            <span className="rounded-full bg-white/70 px-4 py-2 text-[11px] font-semibold shadow-sm ring-1 ring-slate-200/70">
              Central line - Platform 4
            </span>
            <span className="rounded-full bg-white/70 px-4 py-2 text-[11px] font-semibold shadow-sm ring-1 ring-slate-200/70">
              Avg time 58 sec
            </span>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Smart Transit Kiosk
              </p>
              <h1 className="mt-3 font-display text-4xl text-rail-blue sm:text-5xl lg:text-6xl">
                Ticket purchase
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Buy your fare in under a minute. Enter buyer details, choose a ticket, and tap to
                pay.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-6 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Service status
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rail-blue/10 text-xs font-semibold text-rail-blue">
                  NFC
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-800">Contactless ready</p>
                  <p className="text-sm text-slate-500">Card, phone, or watch supported</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
        >
          <section className="space-y-6">
            <div className={cardBase}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Step 1
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-rail-blue">Buyer details</h2>
                </div>
                <span className="rounded-full bg-rail-green/10 px-4 py-2 text-xs font-semibold text-rail-green">
                  Secure kiosk
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

              <div className="mt-8 border-t border-slate-200/70 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Step 2
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                      Payment method
                    </h3>
                  </div>
                  <span className="rounded-full bg-rail-blue/10 px-4 py-2 text-xs font-semibold text-rail-blue">
                    Tap to pay
                  </span>
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
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-600">
                    <p className="text-sm font-semibold text-slate-700">Receipt and QR</p>
                    <p className="mt-1 text-xs text-slate-500">
                      A receipt and QR code will be emailed after payment.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-16 w-full rounded-2xl bg-slate-700 px-8 text-center text-lg font-semibold text-white shadow-[0_18px_40px_-22px_rgba(30,58,95,0.8)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rail-blue/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0.5 active:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className={`${cardBase} relative overflow-hidden lg:sticky lg:top-10`}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-8 h-64 w-64 rounded-full bg-rail-blue/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Ticket summary
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-rail-blue">Fare preview</h2>
                </div>
                <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-500">
                  Live
                </span>
              </div>
              <div className="mt-6 space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4">
                  <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-100" />
                  <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-100" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Ticket details
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>
                      Type: <span className="font-semibold text-slate-800">{ticketTypeLabel}</span>
                    </p>
                    <p>
                      Validity:{' '}
                      <span className="font-semibold text-slate-800">{ticketTypeMeta}</span>
                    </p>
                    <p>
                      Payment:{' '}
                      <span className="font-semibold text-slate-800">{paymentLabel}</span>
                    </p>
                    <p>
                      Buyer:{' '}
                      <span className="font-semibold text-slate-800">
                        {form.buyerName || 'Not provided'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-600">
                  {purchase ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-rail-blue">Ticket confirmed</p>
                      <p>Your ticket is being printed at the kiosk.</p>
                      <div className="rounded-lg border border-rail-green/20 bg-rail-green/10 p-3 text-xs font-semibold text-rail-green">
                        A confirmation email will be sent shortly.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-700">Awaiting payment</p>
                      <p>Complete the payment to generate your ticket.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Pinpad
                </p>
                <p className="mt-1 text-base font-semibold text-slate-800">Contactless payment</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentTone[paymentStatus]}`}
              >
                {paymentStatusCopy[paymentStatus].label}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {paymentStatusCopy[paymentStatus].description}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-rail-blue transition-all duration-500 ease-out"
                style={{ width: `${paymentProgress[paymentStatus]}%` }}
              />
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rail-blue/10 text-sm font-semibold text-rail-blue">
                  NFC
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Keep your card close to the reader
                  </p>
                  <p className="text-xs text-slate-500">
                    Hold steady until you hear a confirmation tone.
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
