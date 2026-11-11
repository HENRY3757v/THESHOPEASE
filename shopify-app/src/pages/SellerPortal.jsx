import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  ShoppingBag,
  PlusCircle,
  Zap,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  PauseCircle,
  PlayCircle,
  IndianRupee,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Package,
  Image as ImageIcon,
} from 'lucide-react'
import { API_BASE_URL } from '../config'

const CATEGORIES_LIST = [
  'Mobiles',
  'Laptops',
  'Tablets',
  'Electronics',
  'Watches',
  'Home & Kitchen',
  'Home & Decor',
  'Fashion',
  'Footwear',
  'Beauty & Care',
  'Jewellery & Eyewear',
  'Groceries',
  'Sports & Auto',
]

function SellerPortal() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'add' | 'billing' | 'revenue'

  // Seller data from API
  const [registered, setRegistered] = useState(false)
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [dailyFeeDue, setDailyFeeDue] = useState(0)
  const [paidToday, setPaidToday] = useState(0)
  const [balanceDueToday, setBalanceDueToday] = useState(0)
  const [adminUpiId, setAdminUpiId] = useState('shopease.platform@okicici')
  const [ledger, setLedger] = useState([])
  const [platformStats, setPlatformStats] = useState(null)

  // Messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Onboarding form + OTP
  const [onboardForm, setOnboardForm] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    email: '',
    cityHub: 'Kolkata Logistics Hub, WB',
    gstin: '',
    upiId: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sandboxOtpNotice, setSandboxOtpNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Add Product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    stock: '25',
    image: '',
    keyFeature: '',
    warranty: '1 Year Seller Warranty',
  })

  // Fee payment UTR form
  const [feeUtr, setFeeUtr] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      try {
        const u = JSON.parse(saved)
        setCurrentUser(u)
        setOnboardForm((prev) => ({
          ...prev,
          ownerName: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
        }))
        loadSellerData(u.id, u.phone)
      } catch (e) {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
    loadPlatformRevenue()
  }, [])

  const loadSellerData = async (userId, phone) => {
    setLoading(true)
    try {
      const q = userId ? `userId=${userId}` : `phone=${encodeURIComponent(phone)}`
      const res = await fetch(`${API_BASE_URL}/api/seller/me?${q}`)
      const data = await res.json()
      if (res.ok) {
        setRegistered(Boolean(data.registered))
        setAdminUpiId(data.adminUpiId || 'shopease.platform@okicici')
        if (data.registered) {
          setSeller(data.seller)
          setProducts(data.products || [])
          setActiveCount(data.activeCount || 0)
          setDailyFeeDue(data.dailyFeeDue || 0)
          setPaidToday(data.paidToday || 0)
          setBalanceDueToday(data.balanceDueToday || 0)
          setLedger(data.ledger || [])
        }
      }
    } catch (err) {
      console.error('Load seller error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPlatformRevenue = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/platform-revenue`)
      const data = await res.json()
      if (res.ok) setPlatformStats(data)
    } catch (err) {
      console.error('Platform revenue load error:', err)
    }
  }

  const handleSendSellerOtp = async () => {
    if (!onboardForm.phone || onboardForm.phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Enter a valid 10-digit mobile number to receive OTP.')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    setSandboxOtpNotice('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: onboardForm.phone, purpose: 'seller_auth' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send OTP.')
        return
      }
      setOtpSent(true)
      if (data.smsMode === 'sandbox' && data.sandboxOtp) {
        setSandboxOtpNotice(
          `Sandbox OTP Mode (Set FAST2SMS_API_KEY / TWILIO_* in Vercel for real SMS): Seller verification code is ${data.sandboxOtp}`
        )
      } else {
        setSandboxOtpNotice(`Live SMS OTP sent to ${data.phone}.`)
      }
    } catch (err) {
      setErrorMsg('Network error sending OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSeller = async (e) => {
    e.preventDefault()
    if (!otpSent || otpCode.trim().length !== 6) {
      setErrorMsg('Verify your mobile number via 6-digit OTP first!')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: onboardForm.phone,
          otp: otpCode.trim(),
          purpose: 'seller_auth',
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setErrorMsg(verifyData.error || 'OTP verification failed.')
        setSubmitting(false)
        return
      }

      const regRes = await fetch(`${API_BASE_URL}/api/seller/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          ...onboardForm,
          otpVerificationId: verifyData.otpVerificationId,
        }),
      })
      const regData = await regRes.json()
      if (!regRes.ok) {
        setErrorMsg(regData.error || 'Seller registration failed.')
        return
      }

      setSuccessMsg('Seller Store verified via OTP & activated on ShopEase!')
      setRegistered(true)
      setSeller(regData.seller)
      await loadSellerData(currentUser?.id, onboardForm.phone)
    } catch (err) {
      setErrorMsg('Network error registering seller.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller.id,
          ...newProduct,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to publish product.')
        return
      }

      setSuccessMsg(`"${data.product.name}" is now LIVE on ShopEase! Daily app fee: ₹20/day.`)
      setNewProduct({
        name: '',
        brand: '',
        category: 'Electronics',
        price: '',
        originalPrice: '',
        stock: '25',
        image: '',
        keyFeature: '',
        warranty: '1 Year Seller Warranty',
      })
      await loadSellerData(currentUser?.id, seller.phone)
      await loadPlatformRevenue()
      setActiveTab('inventory')
    } catch (err) {
      setErrorMsg('Network error publishing product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (prod) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/products/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: prod.is_active === false }),
      })
      if (res.ok) {
        await loadSellerData(currentUser?.id, seller.phone)
        await loadPlatformRevenue()
      }
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Remove this product from ShopEase? Daily ₹20 fee for it will stop immediately.')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadSellerData(currentUser?.id, seller.phone)
        await loadPlatformRevenue()
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handlePayDailyFee = async (e) => {
    e.preventDefault()
    const amountToPay = balanceDueToday > 0 ? balanceDueToday : dailyFeeDue
    if (amountToPay <= 0) {
      setErrorMsg('No active fee balance due right now!')
      return
    }
    const finalUtr = feeUtr.trim() || `UPIFEE-${Date.now().toString().slice(-8)}`
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/pay-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller.id,
          transactionId: finalUtr,
          itemCount: activeCount,
          totalFee: amountToPay,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to record fee payment.')
        return
      }
      setSuccessMsg(data.message)
      setFeeUtr('')
      await loadSellerData(currentUser?.id, seller.phone)
      await loadPlatformRevenue()
    } catch (err) {
      setErrorMsg('Network error paying fee.')
    } finally {
      setSubmitting(false)
    }
  }

  const feePayAmount = balanceDueToday > 0 ? balanceDueToday : dailyFeeDue
  const feeUpiIntent = `upi://pay?pa=${adminUpiId}&pn=ShopEase%20App%20Fee&am=${feePayAmount}&cu=INR&tn=Seller%20Daily%20Fee%20${activeCount}%20Items`
  const feeQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(feeUpiIntent)}`

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Back to Shop"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black leading-tight">
                  Sell on <span className="text-indigo-400">ShopEase</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold">
                  ₹20 / item / day • Direct UPI Platform Billing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> View Live Store
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Global Alerts */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {!currentUser ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-200">
            <Store className="w-14 h-14 text-indigo-500 mx-auto mb-3" />
            <h2 className="text-xl font-black text-slate-900">Sign in to Open Your ShopEase Seller Store</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              List your original products on ShopEase and reach buyers immediately. Simple transparent fee: ₹20 per active item per day to ShopEase UPI.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-5 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs rounded-full shadow-lg"
            >
              Sign In / Create Account First
            </button>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-3 font-semibold">Loading Seller Hub...</p>
          </div>
        ) : !registered ? (
          /* ONBOARDING FORM WITH REAL PHONE OTP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-7 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                  <IndianRupee className="w-3.5 h-3.5" /> Transparent Seller Fee
                </span>
                <h2 className="text-3xl font-black leading-tight">
                  Start Selling on ShopEase in 60 Seconds
                </h2>
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  Zero commission on sales! Only pay a flat platform hosting fee of{' '}
                  <strong className="text-amber-300">₹20 per active item per day</strong> directly to ShopEase Official UPI.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">Phone OTP Verified Store</p>
                    <p className="text-[11px] text-slate-300">Real OTP check prevents fake sellers &amp; spam</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-300 shrink-0" />
                  <div>
                    <p className="font-bold">Admin UPI Fee Settlement</p>
                    <p className="text-[11px] text-slate-300">Daily billing settled to {adminUpiId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
              <h3 className="text-xl font-black text-slate-900 mb-1">Register Seller Store</h3>
              <p className="text-xs text-slate-500 mb-5">Verify your mobile via OTP and link your business UPI ID</p>

              {sandboxOtpNotice && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-bold">
                  🔐 {sandboxOtpNotice}
                </div>
              )}

              <form onSubmit={handleRegisterSeller} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Store / Shop Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Bengal Gadget Hub"
                      value={onboardForm.storeName}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, storeName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.ownerName}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, ownerName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch City / Hub *</label>
                    <input
                      required
                      type="text"
                      value={onboardForm.cityHub}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, cityHub: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19AABCU9603R1ZM"
                      value={onboardForm.gstin}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, gstin: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seller Payout UPI ID * (Real NPCI handle e.g. @ybl, @okicici, @paytm)
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. myshop@okaxis or 9876543210@ybl"
                    value={onboardForm.upiId}
                    onChange={(e) => setOnboardForm((p) => ({ ...p, upiId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* OTP Verification Block */}
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Mobile OTP Authentication (Required)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="10-digit Mobile Number"
                      value={onboardForm.phone}
                      onChange={(e) => setOnboardForm((p) => ({ ...p, phone: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendSellerOtp}
                      disabled={submitting}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 text-sm font-mono tracking-widest bg-white border border-indigo-300 rounded-xl focus:outline-none"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer"
                >
                  {submitting ? 'Verifying & Activating...' : 'Verify OTP & Open Seller Store'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* REGISTERED SELLER DASHBOARD */
          <div className="space-y-6">
            {/* Top Seller Stats & Daily Fee Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Verified Store ✓
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-2 truncate">{seller.store_name}</h2>
                <p className="text-xs text-slate-500 truncate">{seller.upi_id} • {seller.city_hub}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-500">Active Listed Items</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{activeCount}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Live on ShopEase Storefront</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-lg">
                <p className="text-xs font-bold text-amber-100">Daily App Fee (₹20 / item)</p>
                <p className="text-3xl font-black mt-1">₹{dailyFeeDue}</p>
                <p className="text-[11px] text-amber-100 mt-1">
                  {activeCount} active × ₹20/day → {adminUpiId}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-lg flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-100">Today&apos;s Balance Due</p>
                  <p className="text-3xl font-black mt-1">₹{balanceDueToday}</p>
                </div>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="mt-2 py-1.5 px-3 bg-white text-emerald-800 font-black text-xs rounded-full shadow hover:bg-emerald-50 transition self-start"
                >
                  {balanceDueToday > 0 ? 'Pay Fee via UPI →' : `Paid Today ₹${paidToday} ✓`}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeTab === 'inventory' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4" /> My Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeTab === 'add' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> + Add Item (₹20/day)
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeTab === 'billing' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Zap className="w-4 h-4" /> Pay Daily UPI Fee
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeTab === 'revenue' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Admin UPI Revenue
              </button>
            </div>

            {/* TAB 1: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-slate-900">Your Listed Products</h3>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add New Item
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No items listed yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Click &quot;+ Add Item&quot; to publish your first product live on ShopEase.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => {
                      const isActive = p.is_active !== false
                      return (
                        <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
                          <div className="flex gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-20 h-20 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isActive ? 'LIVE • ₹20/day' : 'PAUSED • ₹0/day'}
                              </span>
                              <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 mt-1">{p.name}</h4>
                              <p className="text-sm font-black text-indigo-700 mt-1">
                                ₹{Number(p.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-200">
                            <button
                              onClick={() => handleToggleActive(p)}
                              className="flex-1 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center gap-1"
                            >
                              {isActive ? <><PauseCircle className="w-3.5 h-3.5" /> Pause</> : <><PlayCircle className="w-3.5 h-3.5" /> Activate</>}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADD NEW PRODUCT */}
            {activeTab === 'add' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-3xl">
                <h3 className="text-lg font-black text-slate-900 mb-1">List New Product on ShopEase</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Daily listing charge: <strong>₹20/day</strong> while active. Always upload an authentic original product image URL.
                </p>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Sony WH-1000XM5 Headphones"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Sony, Samsung, boAt"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct((p) => ({ ...p, brand: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      >
                        {CATEGORIES_LIST.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="1999"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="2999"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct((p) => ({ ...p, originalPrice: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Original Product Photo URL * (Direct https:// image URL)
                    </label>
                    <div className="flex gap-3 items-start">
                      <input
                        required
                        type="url"
                        placeholder="https://..."
                        value={newProduct.image}
                        onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))}
                        className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                      <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {newProduct.image ? (
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Key Specs / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. 40H Battery, ANC, Type-C Fast Charge"
                        value={newProduct.keyFeature}
                        onChange={(e) => setNewProduct((p) => ({ ...p, keyFeature: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Available Stock</label>
                      <input
                        type="number"
                        min="1"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    {submitting ? 'Publishing...' : 'Publish Live to ShopEase (+₹20/day App Fee)'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: DAILY ₹20/ITEM APP FEE PAYMENT TO SHOPEASE UPI */}
            {activeTab === 'billing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Pay Daily App Fee to ShopEase UPI</h3>
                  <p className="text-xs text-slate-500">
                    Formula: <strong>{activeCount} active items × ₹20/item = ₹{dailyFeeDue}/day</strong>. Balance due today: <strong>₹{balanceDueToday}</strong>.
                  </p>

                  {feePayAmount > 0 ? (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                      <img src={feeQrUrl} alt="ShopEase Admin UPI QR" className="w-44 h-44 mx-auto rounded-xl shadow border-2 border-white" />
                      <p className="text-xs font-bold text-slate-700">
                        Receiver Admin UPI: <span className="font-mono text-indigo-700">{adminUpiId}</span>
                      </p>
                      <a
                        href={feeUpiIntent}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-full shadow"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Pay ₹{feePayAmount} via UPI App
                      </a>

                      <form onSubmit={handlePayDailyFee} className="pt-3 border-t border-slate-200 text-left space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Enter UPI UTR / Ref ID after paying (or leave blank for Sandbox Ref)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 431298765432"
                          value={feeUtr}
                          onChange={(e) => setFeeUtr(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl"
                        >
                          Confirm ₹{feePayAmount} App Fee Payment
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-black text-emerald-900">All Caught Up for Today!</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Paid today: ₹{paidToday} for {activeCount} active products.
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment History Ledger */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
                  <h3 className="text-base font-black text-slate-900">Daily Fee Ledger</h3>
                  {ledger.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No daily fee payments recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {ledger.map((entry) => (
                        <div key={entry.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-extrabold text-slate-900">
                              ₹{entry.total_fee} ({entry.item_count} items × ₹{entry.fee_per_item})
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {String(entry.billing_date).slice(0, 10)} • Ref: {entry.transaction_id}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px]">
                            PAID TO ADMIN UPI
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PLATFORM ADMIN REVENUE OVERVIEW */}
            {activeTab === 'revenue' && platformStats && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">ShopEase Platform Revenue (Admin UPI)</h3>
                    <p className="text-xs text-slate-500">
                      Collection Account: <span className="font-mono font-bold text-indigo-700">{platformStats.adminUpiId}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                    Rate: ₹{platformStats.dailyFeePerItem}/item/day
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[11px] font-bold text-emerald-700">Total Collected</p>
                    <p className="text-2xl font-black text-emerald-900">₹{platformStats.totalCollected}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                    <p className="text-[11px] font-bold text-indigo-700">Collected Today</p>
                    <p className="text-2xl font-black text-indigo-900">₹{platformStats.todayCollected}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-700">Projected Daily</p>
                    <p className="text-2xl font-black text-amber-900">₹{platformStats.projectedDailyRevenue}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600">Sellers / Items</p>
                    <p className="text-2xl font-black text-slate-900">
                      {platformStats.totalSellers} / {platformStats.activeSellerItems}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default SellerPortal
