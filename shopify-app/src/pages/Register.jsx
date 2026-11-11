import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Truck,
  ArrowRight,
} from 'lucide-react'
import { API_BASE_URL } from '../config'

// ⚠️ IMPORTANT: InputField must be defined OUTSIDE Register component.
// If defined inside, React recreates the component on every re-render → unmount/remount → focus lost (cursor jumps)
function InputField({ id, name, type = 'text', label, placeholder, icon: Icon, value, error, onChange, rightElement, autoFocus = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id={id}
          name={name}
          type={type}
          autoFocus={autoFocus}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 ${rightElement ? 'pr-11' : 'pr-4'} py-2.5 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
          }`}
        />
        {rightElement}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter your full address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Must contain at least one uppercase letter and one number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // NOTE: do NOT call setErrors here — causes re-render → focus loss
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsLoading(true)
    setErrors({})
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed.' })
        return
      }

      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        sessionStorage.setItem('showWelcomeAnimation', 'true')
      }

      setSuccessMsg('Account created successfully! Preparing your delivery experience...')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setErrors({ general: 'Cannot connect to server. Please try again shortly.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const p = formData.password
    if (!p) return null
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500', width: 'w-1/4' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-400', textColor: 'text-yellow-600', width: 'w-2/4' }
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', textColor: 'text-blue-600', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* LEFT SHOWCASE PANEL (Desktop Split Screen) */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-12 flex-col justify-between">
        {/* Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight flex items-center gap-1.5">
              Shop<span className="text-indigo-400">Ease</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">2.0</span>
            </span>
            <p className="text-xs text-slate-400 font-medium">Join 50,000+ Smart Buyers</p>
          </div>
        </div>

        {/* Features Copy */}
        <div className="relative z-10 space-y-7 max-w-md">
          <div>
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Your Free VIP{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                Shopping Pass.
              </span>
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Create your ShopEase account in 30 seconds and unlock brand-direct pricing, instant UPI offers &amp; live tracking.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Flat ₹100 UPI Welcome Cashback</h4>
                <p className="text-xs text-slate-400 mt-0.5">Save instantly on your first brand-direct UPI checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Official GST Invoices &amp; Warranty QR</h4>
                <p className="text-xs text-slate-400 mt-0.5">Download authentic invoices straight from your Orders tab.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Share Dosti Deals with Friends</h4>
                <p className="text-xs text-slate-400 mt-0.5">Grab flat 12% extra discount on trending electronics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-400" />
            <span>Free Express Delivery</span>
          </div>
          <span>•</span>
          <span>100% Buyer Protection</span>
        </div>
      </div>

      {/* RIGHT REGISTRATION FORM */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl mb-3 shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Shop<span className="text-indigo-600">Ease</span> 2.0
            </h1>
            <p className="text-xs text-slate-500 mt-1">Create your account and start shopping</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-950/5 border border-slate-200/80 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create your account ✨</h2>
              <p className="text-xs text-slate-500 mt-1">Fill in your delivery details for fast checkout</p>
            </div>

            {errors.general && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <InputField
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="Suvradip Dey"
                  icon={User}
                  value={formData.name}
                  error={errors.name}
                  onChange={handleChange}
                  autoFocus
                />

                {/* Phone */}
                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  value={formData.phone}
                  error={errors.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <InputField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                error={errors.email}
                onChange={handleChange}
              />

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="address">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House No, Street, City, State, PIN Code"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.address
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars, 1 A-Z, 1 0-9"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.password
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className={`text-[11px] mt-1 font-bold ${strength.textColor}`}>{strength.label}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Terms */}
              <p className="text-[11px] text-slate-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-extrabold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
