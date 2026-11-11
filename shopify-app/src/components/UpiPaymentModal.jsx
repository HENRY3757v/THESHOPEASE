import { useState, useEffect } from 'react'
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowRight,
  Zap,
  Sparkles,
} from 'lucide-react'
import { API_BASE_URL } from '../config'

export default function UpiPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  currentUser,
  cartItems,
  onPaymentSuccess,
}) {
  const [activeTab, setActiveTab] = useState('saved') // 'saved' | 'qr' | 'new'
  const [savedUpiList, setSavedUpiList] = useState([])
  const [selectedUpi, setSelectedUpi] = useState('')
  const [newUpiId, setNewUpiId] = useState('')
  const [provider, setProvider] = useState('Google Pay')
  const [accountName, setAccountName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [txnId, setTxnId] = useState('')

  const PROVIDERS = [
    { name: 'Google Pay', suffix: '@okaxis', color: 'from-blue-500 to-indigo-600' },
    { name: 'PhonePe', suffix: '@ybl', color: 'from-purple-600 to-indigo-700' },
    { name: 'Paytm', suffix: '@paytm', color: 'from-cyan-500 to-blue-600' },
    { name: 'BHIM UPI', suffix: '@upi', color: 'from-emerald-500 to-teal-700' },
  ]

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchUserUpi()
      setIsSuccess(false)
      setErrorMsg('')
    }
  }, [isOpen, currentUser])

  const fetchUserUpi = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/upi?userId=${currentUser.id}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setSavedUpiList(data)
        if (data.length > 0) {
          setSelectedUpi(data[0].upi_id)
          setActiveTab('saved')
        } else {
          setActiveTab('new')
        }
      }
    } catch (err) {
      console.error('Error fetching UPI list:', err)
    }
  }

  const handleSaveUpi = async (e) => {
    e.preventDefault()
    if (!newUpiId.trim() || !newUpiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g., yourname@okhdfcbank or 9876543210@paytm)')
      return
    }

    try {
      setErrorMsg('')
      const res = await fetch(`${API_BASE_URL}/api/upi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          upiId: newUpiId.trim(),
          provider,
          accountName: accountName.trim() || currentUser.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save UPI ID')
        return
      }

      setSavedUpiList([data.upiAccount, ...savedUpiList])
      setSelectedUpi(data.upiAccount.upi_id)
      setNewUpiId('')
      setAccountName('')
      setActiveTab('saved')
    } catch (err) {
      setErrorMsg('Network error while saving UPI.')
    }
  }

  const handleDeleteUpi = async (id, e) => {
    e.stopPropagation()
    try {
      await fetch(`${API_BASE_URL}/api/upi/${id}`, { method: 'DELETE' })
      const updated = savedUpiList.filter((item) => item.id !== id)
      setSavedUpiList(updated)
      if (updated.length > 0) setSelectedUpi(updated[0].upi_id)
      else setSelectedUpi('')
    } catch (err) {
      console.error('Delete UPI error:', err)
    }
  }

  const handlePayNow = async () => {
    const chosenUpi = activeTab === 'saved' ? selectedUpi : (newUpiId || 'instant.qr@shopease')
    if (!chosenUpi && activeTab !== 'qr') {
      setErrorMsg('Please select or enter a UPI ID to proceed.')
      return
    }

    setIsProcessing(true)
    setErrorMsg('')

    // Generate random Indian banking transaction ID
    const generatedTxn = `UPI/${Date.now().toString().slice(-8)}/${Math.floor(100000 + Math.random() * 900000)}`
    setTxnId(generatedTxn)

    // Simulate UPI verification & banking gateway response (1.5s)
    setTimeout(async () => {
      try {
        const orderData = {
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userPhone: currentUser.phone,
          shippingAddress: currentUser.address,
          items: cartItems,
          totalAmount,
          deliveryDays: 2,
          paymentMethod: 'UPI',
          upiId: chosenUpi,
          transactionId: generatedTxn,
        }

        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        })

        const data = await res.json()
        setIsProcessing(false)

        if (res.ok) {
          setIsSuccess(true)
          setTimeout(() => {
            onPaymentSuccess(data.order)
            onClose()
          }, 2200)
        } else {
          setErrorMsg(data.error || 'Payment gateway returned error.')
        }
      } catch (err) {
        setIsProcessing(false)
        setErrorMsg('Error processing payment. Please check your internet.')
      }
    }, 1500)
  }

  if (!isOpen) return null

  // UPI Intent URI for QR code
  const upiIntent = `upi://pay?pa=shopease.merchant@icici&pn=ShopEase%20Retail&am=${totalAmount}&cu=INR&tn=Order%20Payment`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntent)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">UPI Instant Payment</h3>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded-full font-semibold">
                  Zero Extra Fee
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">NPCI Certified 256-Bit Secure Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Ribbon */}
        <div className="bg-emerald-50/80 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Payable Amount:</span>
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Flat ₹100 Cashback Applied
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-sm text-slate-600">
                ₹{totalAmount.toLocaleString('en-IN')} received via UPI
              </p>
              <div className="inline-block bg-slate-100 text-slate-700 text-xs px-4 py-2 rounded-xl font-mono">
                Txn ID: {txnId}
              </div>
              <p className="text-xs text-slate-400">Redirecting to your orders...</p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'saved'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Saved UPI ({savedUpiList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'qr'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`py-2 text-xs font-semibold rounded-xl transition ${
                    activeTab === 'new'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Add New UPI
                </button>
              </div>

              {/* TAB 1: SAVED UPI LIST */}
              {activeTab === 'saved' && (
                <div className="space-y-3">
                  {savedUpiList.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No saved UPI IDs yet.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('new')}
                        className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        + Add your Google Pay or PhonePe ID
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedUpiList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedUpi(item.upi_id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                            selectedUpi === item.upi_id
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-400'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                              {item.provider?.slice(0, 2).toUpperCase() || 'UPI'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{item.upi_id}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span>{item.provider}</span> • <span>{item.account_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedUpi === item.upi_id && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteUpi(item.id, e)}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                              title="Delete UPI"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SCAN QR CODE */}
              {activeTab === 'qr' && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
                    <img
                      src={qrCodeUrl}
                      alt="ShopEase UPI QR"
                      className="w-48 h-48 mx-auto rounded-xl shadow-md border-2 border-white"
                    />
                    <div className="mt-2 text-xs font-semibold text-slate-600">
                      Scan with any UPI App: GPay, PhonePe, Paytm
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                      Google Pay
                    </span>
                    <span className="text-[11px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                      PhonePe
                    </span>
                    <span className="text-[11px] bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-medium">
                      Paytm
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                      BHIM
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: ADD NEW UPI */}
              {activeTab === 'new' && (
                <form onSubmit={handleSaveUpi} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select UPI App
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setProvider(p.name)
                            if (!newUpiId.includes('@')) {
                              setNewUpiId((prev) => (prev ? `${prev}${p.suffix}` : ''))
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center gap-2 ${
                            provider === p.name
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${p.color}`} />
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your UPI ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 9163248305@paytm or rahul@okaxis"
                        value={newUpiId}
                        onChange={(e) => setNewUpiId(e.target.value)}
                        className="w-full pl-3.5 pr-20 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-emerald-600">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Holder Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suvradip Dey"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save & Connect This UPI ID
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure NPCI Payment</span>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isProcessing}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm text-white shadow-lg transition flex items-center gap-2 ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying with Bank...
                </>
              ) : (
                <>
                  Pay ₹{totalAmount.toLocaleString('en-IN')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
