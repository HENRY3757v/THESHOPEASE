import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Truck, Calendar, ShoppingBag, Clock, CheckCircle2, User, Zap, ShieldCheck } from 'lucide-react'
import { API_BASE_URL } from '../config'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        setCurrentUser(u)
        fetchOrders(u.id)
      } catch (e) {
        fetchOrders()
      }
    } else {
      fetchOrders()
    }
  }, [])

  const fetchOrders = async (userId) => {
    setLoading(true)
    try {
      const url = userId ? `${API_BASE_URL}/api/orders?userId=${userId}` : `${API_BASE_URL}/api/orders`
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Your Orders & Deliveries</h1>
              <p className="text-xs text-slate-500">
                Connected to Supabase PostgreSQL table <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono">orders</code>
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2.5 rounded-2xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* User Info Badge */}
        {currentUser && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Orders for: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase Cloud Sync
            </span>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl text-center text-slate-500 shadow-sm border border-slate-200">
            <Clock className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="font-semibold text-sm">Fetching live orders from Supabase...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-slate-500 shadow-sm border border-slate-200">
            <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No orders placed yet!</h3>
            <p className="text-xs text-slate-400 mt-1">Explore our 2,400+ authentic products and try UPI Instant checkout.</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = typeof order.items_summary === 'string'
                ? JSON.parse(order.items_summary)
                : order.items_summary

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Order Number</p>
                      <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Order Date</p>
                      <p className="text-slate-700 font-semibold mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Total Paid</p>
                      <p className="font-black text-slate-900 text-sm mt-0.5">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {order.status}
                      </span>
                    </div>
                  </div>

                  {/* UPI & Transaction details */}
                  <div className="px-4 py-2.5 bg-indigo-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Paid via {order.payment_method || 'UPI'}</span>
                      {order.upi_id && <span className="text-indigo-600 font-mono text-[11px]">({order.upi_id})</span>}
                    </div>
                    {order.transaction_id && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Txn ID: {order.transaction_id}
                      </span>
                    )}
                  </div>

                  {/* Delivery & Address */}
                  <div className="p-4 bg-emerald-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Estimated Delivery: <strong className="underline">{order.delivery_date || 'In 2 Days'}</strong>
                      </span>
                    </div>
                    <div className="text-slate-600 truncate max-w-md">
                      <span>Shipping to: <strong>{order.shipping_address}</strong></span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 divide-y divide-slate-100">
                    {Array.isArray(items) &&
                      items.map((it, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {it.image && (
                              <img src={it.image} alt={it.name} className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200" />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{it.name}</p>
                              <p className="text-slate-400 text-[11px]">Qty: {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <p className="font-extrabold text-slate-900">₹{(it.price * it.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
