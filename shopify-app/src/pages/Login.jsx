import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, EyeOff, Mail, Lock, ShieldCheck, Zap, Truck, Users, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '../config'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Login failed.' })
        return
      }

      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        sessionStorage.setItem('showWelcomeAnimation', 'true')
      }

      navigate('/')
    } catch (err) {
      setErrors({ general: 'Cannot connect to server. Please try again shortly.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* LEFT SHOWCASE PANEL (Desktop Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-12 flex-col justify-between">
        {/* Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

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
            <p className="text-xs text-slate-400 font-medium">India&apos;s Brand-Direct Marketplace</p>
          </div>
        </div>

        {/* Center Hero Copy & Features */}
        <div className="relative z-10 space-y-8 max-w-md">
          <div>
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Shop Smarter.{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                Direct from Brands.
              </span>
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Sign in to access 2,400+ authentic gadgets, instant UPI cashback, and group Dosti Deals with verified GST invoices.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant UPI Payments &amp; Cashback</h4>
                <p className="text-xs text-slate-400 mt-0.5">Connect GPay, PhonePe, Paytm or BHIM once and pay in 1 tap.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Brand Direct Fulfillment</h4>
                <p className="text-xs text-slate-400 mt-0.5">Every item ships directly from official brand hubs with warranty QR.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dosti Deals &amp; VS Spec Compare</h4>
                <p className="text-xs text-slate-400 mt-0.5">Unlock 12% extra group discounts &amp; compare up to 3 models live.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-400" />
            <span>Express Pan-India Delivery</span>
          </div>
          <span>•</span>
          <span>4.8★ Trusted by 50K+ Shoppers</span>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl mb-3 shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Shop<span className="text-indigo-600">Ease</span> 2.0
            </h1>
            <p className="text-xs text-slate-500 mt-1">Your one-stop brand-direct shopping destination</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-950/5 border border-slate-200/80 p-7 sm:p-9">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Welcome back 👋</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to manage orders, UPI &amp; deals</p>
            </div>

            {errors.general && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoFocus
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>

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
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.password
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                  Forgot password?
                </a>
              </div>

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
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-[11px] font-bold text-slate-400">OR</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-extrabold">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
