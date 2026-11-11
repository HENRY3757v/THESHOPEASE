import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowRight,
  Zap,
  Sparkles,
  KeyRound,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { API_BASE_URL } from '../config'

const KNOWN_HANDLES = new Set([
  'okicici', 'okaxis', 'okhdfcbank', 'oksbi', 'ybl', 'ibl', 'axl',
  'paytm', 'ptsbi', 'pthdfc', 'ptaxis', 'ptyes', 'upi', 'apl', 'icici',
  'sbi', 'hdfcbank', 'axisbank', 'kotak', 'indus', 'federal', 'barodampay',
  'fam', 'jupiteraxis', 'sliceaxis', 'naviaxis', 'superyes', 'pingpay', 'waaxis',
])

function checkVpaClient(vpa) {
  const cleaned = (vpa || '').trim().toLowerCase()
  if (!/^[a-z0-9._-]{2,256}@[a-z]{2,64}$/.test(cleaned)) {
    return { valid: false, label: 'Invalid format' }
  }
  const handle = cleaned.split('@')[1]
  if (!KNOWN_HANDLES.has(handle)) {
    return { valid: false, label: `Unknown @${handle}` }
  }
  return { valid: true, label: `Valid NPCI (@${handle})` }
}

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

  // Real Phone OTP Authentication states
  const [phoneInput, setPhoneInput] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpVerifiedId, setOtpVerifiedId] = useState(null)
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const [sandboxOtpNotice, setSandboxOtpNotice] = useState('')

  // QR / Payment states
  const [utrInput, setUtrInput] = useState('')
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
      setPhoneInput(currentUser.phone || '')
      setOtpSent(false)
      setOtpCode('')
      setOtpVerifiedId(null)
      setVerifiedPhone('')
      setSandboxOtpNotice('')
      setUtrInput('')
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

  const handleSendOtp = async () => {
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, '').length < 10) {
      setErrorMsg('Enter a valid 10-digit mobile number to receive your verification OTP.')
      return
    }
    setOtpLoading(true)
    setErrorMsg('')
    setSandboxOtpNotice('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim(), purpose: 'upi_verify' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not send OTP.')
        return
      }
      setOtpSent(true)
      if (data.smsMode === 'sandbox' && data.sandboxOtp) {
        setSandboxOtpNotice(
          `Sandbox OTP Mode (Add FAST2SMS_API_KEY / TWILIO_* env vars in Vercel for live SMS): Your verification code is ${data.sandboxOtp}`
        )
      } else {
        setSandboxOtpNotice(`Live OTP SMS sent to ${data.phone}. Enter the 6-digit code below.`)
      }
    } catch (err) {
      setErrorMsg('Network error sending OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtpAndSaveUpi = async (e) => {
    e.preventDefault()
    const vpaStatus = checkVpaClient(newUpiId)
    if (!vpaStatus.valid) {
      setErrorMsg(`Please enter a valid Indian UPI ID (${vpaStatus.label}). Example: 9876543210@ybl or name@okicici`)
      return
    }

    if (!otpVerifiedId) {
      if (!otpSent || otpCode.trim().length !== 6) {
        setErrorMsg('Send & enter the 6-digit Phone OTP first to authenticate your UPI account.')
        return
      }
    }

    setOtpLoading(true)
    setErrorMsg('')
    try {
      let currentVerificationId = otpVerifiedId
      let currentVerifiedPhone = verifiedPhone

      if (!currentVerificationId) {
        const verifyRes = await fetch(`${API_BASE_URL}/api/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneInput.trim(),
            otp: otpCode.trim(),
            purpose: 'upi_verify',
          }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyRes.ok) {
          setErrorMsg(verifyData.error || 'OTP code did not match.')
          setOtpLoading(false)
          return
        }
        currentVerificationId = verifyData.otpVerificationId
        currentVerifiedPhone = verifyData.phone
        setOtpVerifiedId(currentVerificationId)
        setVerifiedPhone(currentVerifiedPhone)
      }

      const res = await fetch(`${API_BASE_URL}/api/upi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          upiId: newUpiId.trim(),
          provider,
          accountName: accountName.trim() || currentUser.name,
          phone: currentVerifiedPhone || phoneInput.trim(),
          otpVerificationId: currentVerificationId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to link UPI ID')
        return
      }

      setSavedUpiList([data.upiAccount, ...savedUpiList])
      setSelectedUpi(data.upiAccount.upi_id)
      setNewUpiId('')
      setAccountName('')
      setOtpSent(false)
      setOtpCode('')
      setOtpVerifiedId(null)
      setSandboxOtpNotice('')
      setActiveTab('saved')
    } catch (err) {
      setErrorMsg('Network error verifying OTP & saving UPI.')
    } finally {
      setOtpLoading(false)
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
    const chosenUpi = activeTab === 'saved' ? selectedUpi : (activeTab === 'qr' ? 'qr.scan@shopease' : newUpiId)
    if (!chosenUpi) {
      setErrorMsg('Please select a verified UPI ID or switch to Scan QR Code.')
      return
    }

    setIsProcessing(true)
    setErrorMsg('')

    const generatedTxn =
      utrInput.trim().length >= 6
        ? `UTR-${utrInput.trim()}`
        : `UPI/${Date.now().toString().slice(-8)}/${Math.floor(100000 + Math.random() * 900000)}`
    setTxnId(generatedTxn)

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
          }, 2000)
        } else {
          setErrorMsg(data.error || 'Payment gateway returned error.')
        }
      } catch (err) {
        setIsProcessing(false)
        setErrorMsg('Error processing payment. Please check your internet.')
      }
    }, 1000)
  }

  if (!isOpen) return null

  const upiIntent = `upi://pay?pa=shopease.platform@okicici&pn=ShopEase%20Official&am=${totalAmount}&cu=INR&tn=ShopEase%20Order`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntent)}`
  const vpaLiveStatus = newUpiId.includes('@') ? checkVpaClient(newUpiId) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">UPI + Phone OTP Pay</h3>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded-full font-bold">
                  OTP Authenticated
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">NPCI VPA Check + Mobile OTP Verified</p>
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
            <div className="text-2xl font-black text-slate-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Instant Brand Checkout
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {sandboxOtpNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs font-bold">
              🔐 {sandboxOtpNotice}
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Payment Recorded &amp; Confirmed!</h4>
              <p className="text-sm text-slate-600">
                ₹{totalAmount.toLocaleString('en-IN')} order placed via UPI
              </p>
              <div className="inline-block bg-slate-100 text-slate-700 text-xs px-4 py-2 rounded-xl font-mono">
                Ref: {txnId}
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
                  className={`py-2 text-xs font-bold rounded-xl transition ${
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
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'qr'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  UPI App / QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`py-2 text-xs font-bold rounded-xl transition ${
                    activeTab === 'new'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Link via OTP
                </button>
              </div>

              {/* TAB 1: SAVED OTP-VERIFIED UPI LIST */}
              {activeTab === 'saved' && (
                <div className="space-y-3">
                  {savedUpiList.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
                      <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">No OTP-verified UPI IDs yet.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('new')}
                        className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
                      >
                        + Verify Phone OTP &amp; Link UPI ID
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
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-slate-800">{item.upi_id}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                  OTP Verified ✓
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span>{item.provider}</span> • <span>{item.account_name}</span>
                                {item.verified_phone && <span>• {item.verified_phone}</span>}
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

              {/* TAB 2: SCAN QR CODE + DIRECT UPI APP DEEP LINK */}
              {activeTab === 'qr' && (
                <div className="text-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
                    <img
                      src={qrCodeUrl}
                      alt="ShopEase UPI QR"
                      className="w-44 h-44 mx-auto rounded-xl shadow-md border-2 border-white"
                    />
                    <div className="mt-2 text-xs font-bold text-slate-700">
                      Pay to: <span className="font-mono text-indigo-700">shopease.platform@okicici</span>
                    </div>
                  </div>

                  <div>
                    <a
                      href={upiIntent}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-full shadow-md transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open GPay / PhonePe / Paytm App
                    </a>
                  </div>

                  <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      12-Digit UPI UTR / Reference No. (Optional for test, Required for Live QR)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 431209876543"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ADD NEW UPI WITH REAL PHONE OTP AUTHENTICATION */}
              {activeTab === 'new' && (
                <form onSubmit={handleVerifyOtpAndSaveUpi} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Select UPI App
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDERS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setProvider(p.name)
                            if (newUpiId && !newUpiId.includes('@')) {
                              setNewUpiId(`${newUpiId}${p.suffix}`)
                            }
                          }}
                          className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Your Real UPI ID (NPCI VPA Checked)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 9876543210@ybl or name@okaxis"
                        value={newUpiId}
                        onChange={(e) => setNewUpiId(e.target.value)}
                        className="w-full pl-3.5 pr-32 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                      {vpaLiveStatus && (
                        <span
                          className={`absolute right-3 top-2.5 text-[11px] font-extrabold ${
                            vpaLiveStatus.valid ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {vpaLiveStatus.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suvradip Dey"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Step 3: Phone OTP Verification */}
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>3. Phone OTP Authentication (Required)</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="10-digit Mobile Number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shrink-0"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>

                    {otpSent && (
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-800 mb-1">
                          Enter 6-Digit OTP Sent to Your Phone
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2 text-sm font-mono tracking-widest bg-white border border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {otpLoading ? 'Verifying OTP...' : 'Verify OTP & Link UPI ID'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>OTP &amp; NPCI Protected</span>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isProcessing || (activeTab === 'saved' && !selectedUpi)}
              className={`px-6 py-2.5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition flex items-center gap-2 ${
                isProcessing || (activeTab === 'saved' && !selectedUpi)
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
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
