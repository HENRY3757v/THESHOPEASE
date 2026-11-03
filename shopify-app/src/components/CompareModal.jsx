import { X, Check, ShoppingCart, Sparkles, Star, Truck, ShieldCheck, ArrowRight } from 'lucide-react'

function CompareModal({ products, onClose, onAddToCart }) {
  if (!products || products.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">1-Click Live Spec Comparison (VS Mode)</h3>
              <p className="text-xs text-slate-400">Side-by-side technical specification & value breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, idx) => {
              const specs = typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : p.specs || {}

              return (
                <div
                  key={p.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition relative"
                >
                  {/* Winner / Verdict Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Product #{idx + 1}
                    </span>
                  </div>

                  <div>
                    {/* Image */}
                    <div className="h-44 bg-white rounded-xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>

                    {/* Brand & Name */}
                    <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                      {p.brand} &bull; {p.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">
                      {p.name}
                    </h4>

                    {/* Price Comparison */}
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-slate-900">₹{Number(p.price).toLocaleString()}</span>
                        <span className="text-xs text-slate-400 line-through">₹{Number(p.original_price).toLocaleString()}</span>
                        <span className="text-xs font-bold text-emerald-600">{p.discount}</span>
                      </div>
                      {p.group_price && (
                        <p className="text-[11px] text-amber-600 font-bold mt-1">
                          👥 Dosti Deal Price: ₹{Number(p.group_price).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Rating & Delivery */}
                    <div className="flex items-center justify-between text-xs my-3 text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {p.rating} / 5.0
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" /> {p.delivery_days} Days Delivery
                      </span>
                    </div>

                    {/* Structured Specs Breakdown */}
                    <div className="space-y-2.5 text-xs pt-3 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Key Hardware / Feature</span>
                        <p className="text-slate-800 font-medium">{specs.key_feature || 'Premium Build Quality'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Battery / Capacity / Power</span>
                        <p className="text-slate-800 font-medium">{specs.battery || specs.power || specs.capacity || 'High Efficiency Output'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ideal For</span>
                        <p className="text-slate-800 font-medium">{specs.ideal_for || 'Daily Consumer Use'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Weight & Dimensions</span>
                        <p className="text-slate-800 font-medium">{specs.weight || specs.dimensions || 'Standard Ergonomic Size'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Official Warranty</span>
                        <p className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> {specs.warranty || '1 Year Brand Warranty'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="mt-5 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onAddToCart(p)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add This to Cart
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Comparing <strong>{products.length}</strong> items side-by-side</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  )
}

export default CompareModal
