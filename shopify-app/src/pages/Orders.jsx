import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Truck, Calendar, ShoppingBag, Clock, CheckCircle2, User } from 'lucide-react'
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
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
              <p className="text-xs text-slate-500">
                Connected to MySQL table <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">shopify_db.orders</code>
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* User Info Badge */}
        {currentUser && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Orders for: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ● Relational Link Active
            </span>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-200">
            <Clock className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p>Fetching your orders from database...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No orders placed yet!</h3>
            <p className="text-xs text-slate-400 mt-1">Go to the shop, add items to your cart, and click checkout.</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
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
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Order Number</p>
                      <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Order Date</p>
                      <p className="text-slate-700 font-medium mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-bold text-[10px]">Total Amount</p>
                      <p className="font-extrabold text-slate-900 text-sm mt-0.5">₹{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
                        <Clock className="w-3 h-3" /> {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Address */}
                  <div className="p-4 bg-emerald-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Estimated Delivery by: <strong className="underline">{new Date(order.delivery_date).toDateString()}</strong>
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
                              <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-lg bg-slate-100" />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{it.name}</p>
                              <p className="text-slate-400 text-[11px]">Qty: {it.quantity} × ₹{Number(it.price).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="font-bold text-slate-900">₹{(it.price * it.quantity).toLocaleString()}</p>
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
