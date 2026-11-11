import { X, Printer, ShieldCheck, QrCode, CheckCircle2, Building2 } from 'lucide-react'

export default function InvoiceModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null

  const items = typeof order.items_summary === 'string'
    ? JSON.parse(order.items_summary)
    : (order.items_summary || [])

  const brandStore = order.brand_store || 'Official Brand Flagship Partner Store'
  const brandHub = order.brand_hub || 'National Central Logistics Terminal'
  const invoiceNum = order.invoice_number || `TAX-${order.id || 100234}`
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const warrantyQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=ShopEase-Warranty-Verify-${order.order_number}-${invoiceNum}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] my-auto">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Official Brand Tax Invoice & Warranty Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs bg-white" id="invoice-print-area">
          {/* Invoice Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-1.5">
                <span>Shop<span className="text-indigo-600">Ease</span></span>
                <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Direct Brand Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Official Marketplace Partner for Brand Direct Logistics</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">TAX INVOICE / CASH MEMO</span>
              <span className="text-sm font-black font-mono text-slate-900">{invoiceNum}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Date: {orderDate}</p>
            </div>
          </div>

          {/* Seller & Buyer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Sold & Dispatched Directly By:
              </span>
              <h4 className="text-sm font-bold text-slate-900">{brandStore}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">Fulfillment Hub: {brandHub}</p>
              <p className="text-[11px] text-slate-600 font-mono">GSTIN: 27AAGCB4321R1Z9</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                ✓ 100% Genuine Authorized Partner
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed & Shipped To:
              </span>
              <h4 className="text-sm font-bold text-slate-900">{order.user_name || 'Customer'}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 max-w-[220px] sm:ml-auto">
                {order.shipping_address || 'Address provided during checkout'}
              </p>
              <p className="text-[11px] text-slate-600">{order.user_email || ''}</p>
              <p className="text-[11px] text-slate-600">{order.user_phone || ''}</p>
            </div>
          </div>

          {/* Payment & Order Tracking Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Order Number</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">{order.order_number}</span>
              {order.external_order_id && (
                <span className="text-[9px] text-indigo-700 font-mono block">Ext: {order.external_order_id}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Payment Mode</span>
              <span className="font-bold text-emerald-700 text-[11px]">{order.payment_method || 'UPI Instant'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Bank / Partner Ref</span>
              <span className="font-mono text-slate-700 text-[10px] truncate block">{order.transaction_id || order.external_order_id || 'UPI/LIVE/VERIFIED'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Fulfillment Source</span>
              <span className="font-bold text-slate-900 text-[11px]">{order.external_site || order.delivery_date || 'Brand Direct'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Brand Store</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">HSN Code: 85183000 • S/N: {order.order_number}-{idx + 1}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">{brandStore}</td>
                    <td className="py-3 px-3 text-center font-bold">{it.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-600">₹{Number(it.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-right">
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Items Subtotal:</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Shipping & Brand Handling:</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>GST (18% Integrated):</span>
                <span>Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Official Warranty Seal & Direct Service Support */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h5 className="font-bold text-emerald-950 text-xs">
                  Official 1-Year Pan-India Brand Warranty Activated
                </h5>
                <p className="text-[11px] text-emerald-800">
                  This Tax Invoice acts as your official warranty receipt across all 450+ Brand Service Centers nationwide.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <img src={warrantyQrUrl} alt="Verify Warranty" className="w-14 h-14 rounded-lg border border-emerald-300 bg-white p-0.5" />
              <div className="text-[10px] text-emerald-900 leading-tight">
                <span className="font-bold block">Scan QR Code</span>
                to register warranty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
