import { useState } from 'react'
import {
  X,
  Star,
  Truck,
  ShieldCheck,
  Zap,
  Users,
  Check,
  MapPin,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  ShoppingBag,
  Building2,
  FileText,
} from 'lucide-react'

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenCompare,
  onOpenDosti,
  onDirectUpiBuy,
}) {
  const [pincode, setPincode] = useState('700034')
  const [isPincodeChecked, setIsPincodeChecked] = useState(true)
  const [selectedColor, setSelectedColor] = useState(0)

  if (!isOpen || !product) return null

  let parsedSpecs = {}
  try {
    if (typeof product.specs === 'string') {
      parsedSpecs = JSON.parse(product.specs)
    } else if (typeof product.specs === 'object') {
      parsedSpecs = product.specs || {}
    }
  } catch (e) {
    parsedSpecs = {}
  }

  const sampleColors = [
    { name: parsedSpecs.colorway || 'Graphite Black', hex: '#1e293b' },
    { name: 'Pearl White', hex: '#f8fafc' },
    { name: 'Pacific Blue', hex: '#2563eb' },
    { name: 'Natural Titanium', hex: '#78716c' },
  ]

  const handlePincodeCheck = (e) => {
    e.preventDefault()
    if (pincode.length >= 6) {
      setIsPincodeChecked(true)
    }
  }

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

        {/* LEFT COLUMN: Gallery & Hero Image */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 relative">
          {/* Badge */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {product.badge && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {product.badge}
              </span>
            )}
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {product.brand}
            </span>
          </div>

          {/* Main Product Image with Zoom */}
          <div className="relative my-auto py-6 group flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-72 sm:max-h-80 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300 rounded-2xl"
            />
          </div>

          {/* Colorway Switcher */}
          <div className="mt-4 pt-4 border-t border-slate-200/80">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Colorway:</span>
              <span className="text-indigo-600 font-bold">{sampleColors[selectedColor].name}</span>
            </div>
            <div className="flex gap-2">
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
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate max-w-[80px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Brand Store, Specs, Delivery & Actions */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          {/* Title & Ratings */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              {product.category}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-xs text-slate-500">
                ({(product.reviews_count || 1200).toLocaleString('en-IN')} verified reviews)
              </span>
              <span className="text-xs font-semibold text-emerald-600 ml-auto flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Genuine
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
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

            {/* Dosti Deal callout */}
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

          {/* OFFICIAL BRAND STOREFRONT / DIRECT SELLER WIDGET */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center font-black text-xs text-indigo-300 shrink-0">
                  <Building2 className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {product.seller_name || `${product.brand} Official Flagship Store`}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                      ✓ Direct Brand Store
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                    Hub: {product.seller_hub || 'Central Logistics Terminal'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold justify-end">
                  <span>{product.seller_rating || 4.9}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-[9px] text-slate-400">Store Score</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {product.warranty_policy || 'Official Pan-India Brand Warranty & Service'}
              </span>
              <span className="font-mono text-slate-400 text-[9px]">
                GST: {product.seller_gstin || '07AAACX9999X1Z1'}
              </span>
            </div>
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
                  {parsedSpecs.key_feature || 'Flagship Architecture & Engineering'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Battery / Power</span>
                <span className="font-semibold text-slate-800 line-clamp-2">
                  {parsedSpecs.battery || parsedSpecs.power || 'High-Efficiency All-Day Life'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Warranty</span>
                <span className="font-semibold text-slate-800 line-clamp-2">
                  {parsedSpecs.warranty || '1 Year Direct Brand Warranty'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ideal For</span>
                <span className="font-semibold text-slate-800 line-clamp-2">
                  {parsedSpecs.ideal_for || 'Everyday Durability & Top Performance'}
                </span>
              </div>
            </div>
          </div>

          {/* Pin Code Delivery Estimator */}
          <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-xs">
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-32 bg-white px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition"
              >
                Check
              </button>
              {isPincodeChecked && (
                <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 ml-auto">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Free Dispatch from Brand Hub!
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
                className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  onDirectUpiBuy(product)
                  onClose()
                }}
                className="py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
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
              className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" /> Compare with other {product.category}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
