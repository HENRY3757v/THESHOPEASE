import { useState, useEffect } from 'react'
import { Truck, Package, MapPin, CheckCircle2, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react'

function DeliveryWelcomeAnimation({ user, onComplete }) {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50) // ~2.5 seconds total

    // Step tracker
    const timer1 = setTimeout(() => setStep(2), 800)
    const timer2 = setTimeout(() => setStep(3), 1600)

    return () => {
      clearInterval(interval)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 transition flex items-center gap-1"
        >
          Skip <ArrowRight className="w-3 h-3" />
        </button>

        {/* 1. DELIVERY TRUCK ANIMATION SCENE */}
        <div className="relative h-28 w-full flex items-center justify-center my-4 overflow-hidden">
          {/* Moving Road */}
          <div className="absolute bottom-4 left-0 right-0 h-1 bg-slate-700/60 overflow-hidden">
            <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,#6366f1_50%,transparent_100%)] animate-[pulse_1s_infinite]" />
          </div>

          {/* Animated Delivery Truck */}
          <div className="relative z-10 flex flex-col items-center animate-bounce duration-700">
            <div className="relative">
              {/* Van Body */}
              <div className="w-20 h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg border border-indigo-400/30">
                <Truck className="w-8 h-8 text-white" />
              </div>

              {/* Floating Package */}
              <div className="absolute -top-3 -right-2 w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center text-slate-950 shadow-md animate-pulse">
                <Package className="w-4 h-4" />
              </div>
            </div>

            {/* Wheels */}
            <div className="flex gap-10 mt-1">
              <div className="w-3.5 h-3.5 bg-slate-400 rounded-full border-2 border-slate-900 animate-spin" />
              <div className="w-3.5 h-3.5 bg-slate-400 rounded-full border-2 border-slate-900 animate-spin" />
            </div>
          </div>
        </div>

        {/* 2. GREETING & PERSONALIZATION */}
        <div className="space-y-2 mt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Fast Delivery Active
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight">
            Welcome aboard, {user ? user.name : 'Shopper'}! 👋
          </h3>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 max-w-sm mx-auto truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Delivering to: <strong className="text-slate-200">{user?.address || 'Your verified doorstep address'}</strong></span>
          </p>
        </div>

        {/* 3. STEP CHECKMARKS */}
        <div className="grid grid-cols-3 gap-2 my-6 text-[11px]">
          <div className={`p-2 rounded-xl border transition-all ${
            step >= 1 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Profile Verified</span>
          </div>

          <div className={`p-2 rounded-xl border transition-all ${
            step >= 2 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <Truck className={`w-4 h-4 mx-auto mb-1 ${step >= 2 ? 'text-indigo-400' : 'text-slate-600'}`} />
            <span>Hub Connected</span>
          </div>

          <div className={`p-2 rounded-xl border transition-all ${
            step >= 3 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <ShoppingBag className={`w-4 h-4 mx-auto mb-1 ${step >= 3 ? 'text-amber-400' : 'text-slate-600'}`} />
            <span>10,000+ Deals</span>
          </div>
        </div>

        {/* 4. PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Preparing your personalized marketplace... ({progress}%)
          </p>
        </div>

      </div>
    </div>
  )
}

export default DeliveryWelcomeAnimation
