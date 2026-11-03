import { useState } from 'react'
import { X, Users, Copy, Check, Share2, Sparkles, Clock, ShieldCheck, ShoppingCart } from 'lucide-react'

function DostiDealModal({ product, onClose, onAddDostiToCart }) {
  const [copied, setCopied] = useState(false)

  if (!product) return null

  const dostiCode = `DOSTI-${product.id}-${Math.floor(1000 + Math.random() * 9000)}`
  const shareUrl = `${window.location.origin}/?dosti=${dostiCode}&product=${product.id}`
  const savings = Number(product.price) - Number(product.group_price || product.price * 0.88)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Bhai, ami ShopEase-e "${product.name}" kinchi! Tumi-o eksathe kinle amra dujon-i ₹${savings.toLocaleString()} extra discount pabo! Check it out here: ${shareUrl}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-slate-950/30 px-3 py-1 rounded-full text-xs font-bold text-amber-200 mb-2">
            <Users className="w-3.5 h-3.5" /> Dosti Deal &bull; Group Buy Mode
          </div>
          <h3 className="text-2xl font-black tracking-tight">Buy with a Friend & Save ₹{savings.toLocaleString()}!</h3>
          <p className="text-xs text-amber-100 mt-1">Exclusive Indian feature: Invite 1 friend, and both of you get the deal price.</p>
        </div>

        {/* Product Card Summary */}
        <div className="p-6">
          <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl bg-white border border-slate-200" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                {product.brand} &bull; {product.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</h4>

              {/* Price comparison */}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-indigo-600">
                  ₹{Number(product.group_price || product.price * 0.88).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 line-through">₹{Number(product.price).toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save ₹{savings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Group Slot Status */}
          <div className="my-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-900 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Group Slots Status (1 / 2 Joined):
              </span>
              <span className="text-amber-700 font-mono text-[11px]">23h : 48m left</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mx-auto mb-1">
                  You
                </div>
                <p className="font-bold text-[11px] text-slate-800">You (Slot 1)</p>
                <span className="text-[10px] text-emerald-600 font-semibold">● Ready</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-dashed border-amber-300 text-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mx-auto mb-1">
                  +1
                </div>
                <p className="font-bold text-[11px] text-slate-800">Friend (Slot 2)</p>
                <span className="text-[10px] text-amber-600 font-semibold">Waiting for Invite</span>
              </div>
            </div>
          </div>

          {/* Share Link Actions */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Share your Dosti Deal invite link:
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-600 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Invite Friend on WhatsApp (Get Discount)
            </button>
          </div>

          {/* Action: Add to cart at Dosti Price */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                onAddDostiToCart(product)
                onClose()
              }}
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3 rounded-2xl text-sm transition shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              Lock Dosti Deal & Add to Cart (₹{Number(product.group_price || product.price * 0.88).toLocaleString()})
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

export default DostiDealModal
