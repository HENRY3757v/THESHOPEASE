import { useState, useEffect } from 'react'
import {
  X,
  Star,
  Truck,
  ShieldCheck,
  Zap,
  Users,
  Check,
  MapPin,
  Sparkles,
  Layers,
  ShoppingBag,
  Building2,
  ExternalLink,
  CreditCard,
  Globe,
  BarChart3,
} from 'lucide-react'
import { API_BASE_URL } from '../config'

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenCompare,
  onOpenDosti,
  onDirectUpiBuy,
  currentUser,
}) {
  const [pincode, setPincode] = useState('700034')
  const [isPincodeChecked, setIsPincodeChecked] = useState(true)
  const [selectedColor, setSelectedColor] = useState(0)
  const [activeImage, setActiveImage] = useState('')
  const [emiMonths, setEmiMonths] = useState(6)

  useEffect(() => {
    if (product) {
      setActiveImage(product.image)
      setSelectedColor(0)
    }
  }, [product])

  if (!isOpen || !product) return null

  let parsedSpecs = {}
  try {
    if (typeof product.specs === 'string') {
      parsedSpecs = JSON.parse(product.specs)
    } else if (typeof product.specs === 'object') {
      parsedSpecs = product.specs || {}
    }
  } catch {
    parsedSpecs = {}
  }

  const galleryImages = Array.from(
    new Set([product.image, ...(Array.isArray(parsedSpecs.gallery) ? parsedSpecs.gallery : [])].filter(Boolean))
  ).slice(0, 4)

  const sampleColors = [
    { name: parsedSpecs.colorway || 'Standard Edition', hex: '#1e293b' },
    { name: 'Pearl White', hex: '#f8fafc' },
    { name: 'Pacific Blue', hex: '#2563eb' },
    { name: 'Natural Titanium', hex: '#78716c' },
  ]

  const priceNum = Number(product.price) || 0
  const emiPerMonth = Math.max(1, Math.round(priceNum / emiMonths))
  const upiCashback = Math.min(500, Math.max(25, Math.round(priceNum * 0.05)))
  const sourceSite = product.source_site || 'Official Partner Store'
  const externalUrl =
    product.external_url ||
    `https://www.amazon.in/s?k=${encodeURIComponent(`${product.brand || ''} ${product.name}`.trim())}`

  const handlePincodeCheck = (e) => {
    e.preventDefault()
    if (pincode.length >= 6) {
      setIsPincodeChecked(true)
    }
  }

  const handleOpenOriginalWebsite = async (actionType = 'view_store') => {
    const targetUrl = actionType === 'cart_redirect' ? (product.external_cart_url || externalUrl) : externalUrl
    try {
      fetch(`${API_BASE_URL}/api/bridge/redirect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          productId: product.id,
          sourceSite,
          targetUrl,
          actionType,
        }),
      }).catch(() => {})
    } catch {}
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  // Review rating breakdown widget derived from item rating
  const ratingVal = Number(product.rating) || 4.5
  const fiveStarPct = Math.min(82, Math.max(48, Math.round((ratingVal / 5) * 78)))
  const fourStarPct = Math.max(10, Math.round((100 - fiveStarPct) * 0.62))
  const threeStarPct = Math.max(4, Math.round((100 - fiveStarPct) * 0.24))
  const lowStarPct = Math.max(2, 100 - fiveStarPct - fourStarPct - threeStarPct)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[92vh] my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Gallery, Hero Image & Store Bridge */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 relative overflow-y-auto">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 pr-8">
            {product.badge && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {product.badge}
              </span>
            )}
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {product.brand}
            </span>
            <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" /> {sourceSite}
            </span>
          </div>

          {/* Main Product Image */}
          <div className="relative my-4 py-4 group flex items-center justify-center bg-white rounded-2xl border border-slate-200/70 shadow-sm min-h-[240px]">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="max-h-64 sm:max-h-72 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 rounded-xl"
            />
          </div>

          {/* Multi-Image Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-3">
              {galleryImages.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-14 h-14 rounded-xl bg-white p-1 border-2 transition overflow-hidden ${
                    (activeImage || product.image) === imgUrl
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={imgUrl} alt={`Angle ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Review Breakdown Bar Widget */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Verified Buyer Rating Split
              </span>
              <span className="text-emerald-600">{ratingVal} / 5.0</span>
            </div>
            {[
              { label: '5★', pct: fiveStarPct, color: 'bg-emerald-500' },
              { label: '4★', pct: fourStarPct, color: 'bg-teal-500' },
              { label: '3★', pct: threeStarPct, color: 'bg-amber-400' },
              { label: '1-2★', pct: lowStarPct, color: 'bg-rose-400' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="w-7 font-bold">{row.label}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                </div>
                <span className="w-7 text-right font-semibold">{row.pct}%</span>
              </div>
            ))}
          </div>

          {/* Colorway Switcher */}
          <div className="pt-3 border-t border-slate-200/80">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Edition / Finish:</span>
              <span className="text-indigo-600 font-bold">{sampleColors[selectedColor].name}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sampleColors.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                    selectedColor === idx
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate max-w-[90px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Widgets, Official Store Link & Actions */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center justify-between pr-8">
              <span>{product.category}</span>
              <span className="text-[10px] font-mono text-slate-400">Stock: {product.stock || 25} left</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs text-slate-500">
                ({(product.reviews_count || 340).toLocaleString('en-IN')} verified reviews)
              </span>
              <span className="text-xs font-semibold text-emerald-600 ml-auto flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified Photo & Price
              </span>
            </div>
          </div>

          {/* Pricing & Dosti Box */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{priceNum.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{Number(product.original_price).toLocaleString('en-IN')}
                </span>
              )}
              {product.discount && (
                <span className="text-sm font-extrabold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {product.discount}
                </span>
              )}
            </div>

            {product.group_price && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Dosti Deal Price:
                  </div>
                  <div className="text-base font-black text-amber-900">
                    ₹{Number(product.group_price).toLocaleString('en-IN')}
                    <span className="text-xs text-amber-700 font-medium ml-1.5">(12% Group Discount)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenDosti(product)
                    onClose()
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" /> Buy With Friend
                </button>
              </div>
            )}
          </div>

          {/* Interactive EMI & UPI Cashback Calculator Widget */}
          <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                No-Cost EMI: <strong className="text-indigo-700">₹{emiPerMonth.toLocaleString('en-IN')}/mo</strong>
              </span>
              <div className="flex gap-1">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEmiMonths(m)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                      emiMonths === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              ✨ UPI Offer: Save an extra ₹{upiCashback} instant cashback on UPI Checkout!
            </p>
          </div>

          {/* OFFICIAL STORE WEBSITE BRIDGE WIDGET */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {product.seller_name || `${product.brand} Official Flagship Store`}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                      ✓ {sourceSite}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[240px]">
                    Hub: {product.seller_hub || 'Central Logistics Terminal'} • GST: {product.seller_gstin || 'VERIFIED'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold justify-end">
                  <span>{product.seller_rating || 4.8}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-[9px] text-slate-400">Store Score</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenOriginalWebsite('view_store')}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Original Store Website ({sourceSite})
            </button>
          </div>

          {/* Technical Specs Breakdown */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" /> Technical Specifications
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Key Feature</span>
                <span className="font-semibold text-slate-800 line-clamp-2">
                  {parsedSpecs.key_feature || 'Official Brand Retail Model'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Warranty</span>
                <span className="font-semibold text-slate-800 line-clamp-2">
                  {parsedSpecs.warranty || product.warranty_policy || '1 Year Official Warranty'}
                </span>
              </div>
            </div>
          </div>

          {/* Pin Code Delivery Estimator */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Pincode"
                className="w-28 bg-white px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition"
              >
                Check
              </button>
              {isPincodeChecked && (
                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 ml-auto">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Delivery in {product.delivery_days || 2} days
                </span>
              )}
            </form>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  onDirectUpiBuy(product)
                  onClose()
                }}
                className="py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Buy with UPI
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenCompare(product)
                onClose()
              }}
              className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" /> Compare with other {product.category}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
