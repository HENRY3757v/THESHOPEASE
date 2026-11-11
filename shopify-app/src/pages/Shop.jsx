import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  MapPin,
  Star,
  LogOut,
  X,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpDown,
  Sparkles,
  Users,
  ArrowRight,
  Zap,
  Layers,
  Smartphone,
  Laptop,
  Utensils,
  Headphones,
  Watch,
  Gamepad2,
  Shirt,
  Footprints,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

import DeliveryWelcomeAnimation from '../components/DeliveryWelcomeAnimation'
import CompareModal from '../components/CompareModal'
import DostiDealModal from '../components/DostiDealModal'
import ProductDetailModal from '../components/ProductDetailModal'
import UpiPaymentModal from '../components/UpiPaymentModal'

const CATEGORY_ICONS = {
  All: Sparkles,
  Mobiles: Smartphone,
  Laptops: Laptop,
  'Home & Kitchen': Utensils,
  Electronics: Headphones,
  Watches: Watch,
  Gaming: Gamepad2,
  Fashion: Shirt,
  Footwear: Footprints,
}

function Shop() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [showWelcome, setShowWelcome] = useState(() => {
    return sessionStorage.getItem('showWelcomeAnimation') === 'true'
  })

  // Products & Database states
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Innovative Features States: VS Compare, Dosti Deal & Modals
  const [compareList, setCompareList] = useState([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [dostiProduct, setDostiProduct] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)

  // UPI Payment states
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false)
  const [upiPayItems, setUpiPayItems] = useState([])
  const [upiPayTotal, setUpiPayTotal] = useState(0)

  // Cart & Order states
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  // Live countdown timer for Deals of the Day (04h:28m:12s)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 12 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 4, minutes: 30, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load User from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Error parsing user data', e)
      }
    }
  }, [])

  // Load Categories list
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(['All', ...data.map((c) => c.category)])
        }
      })
      .catch((err) => console.error('Fetch categories error:', err))
  }, [])

  // Load Brands dynamically for selected category
  useEffect(() => {
    const url =
      selectedCategory && selectedCategory !== 'All'
        ? `${API_BASE_URL}/api/brands?category=${encodeURIComponent(selectedCategory)}`
        : `${API_BASE_URL}/api/brands`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(['All', ...data.map((b) => b.brand)])
        }
      })
      .catch((err) => console.error('Fetch brands error:', err))
  }, [selectedCategory])

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch paginated products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '24',
          sortBy,
        })
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory)
        }
        if (selectedBrand && selectedBrand !== 'All') {
          params.append('brand', selectedBrand)
        }
        if (debouncedSearch && debouncedSearch.trim()) {
          params.append('search', debouncedSearch.trim())
        }

        const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
          setTotalCount(data.totalCount || 0)
          setTotalPages(data.totalPages || 1)
        }
      } catch (err) {
        console.error('Fetch products error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, selectedCategory, selectedBrand, debouncedSearch, sortBy])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    navigate('/login')
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          quantity: 1,
        },
      ]
    })
    setNotification(`Added "${product.name.slice(0, 25)}..." to cart!`)
    setTimeout(() => setNotification(''), 2500)
  }

  const addDostiToCart = (product) => {
    const dostiPrice = Number(product.group_price || product.price * 0.88)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === `dosti-${product.id}`)
      if (existing) {
        return prev.map((item) =>
          item.id === `dosti-${product.id}` ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: `dosti-${product.id}`,
          name: `${product.name} (Dosti Deal 👥)`,
          price: dostiPrice,
          image: product.image,
          quantity: 1,
        },
      ]
    })
    setNotification(`🎉 Dosti Deal Activated! Saved ₹${(product.price - dostiPrice).toLocaleString()}`)
    setTimeout(() => setNotification(''), 3000)
  }

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 products side-by-side!')
        return prev
      }
      return [...prev, product]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  // Trigger UPI Payment Modal for Entire Cart
  const handleCheckoutWithUpi = () => {
    if (!currentUser) {
      alert('Please Sign In first to place an order!')
      navigate('/login')
      return
    }
    if (cart.length === 0) return
    setUpiPayItems(cart)
    setUpiPayTotal(cartTotal)
    setIsCartOpen(false)
    setIsUpiModalOpen(true)
  }

  // Trigger Direct UPI Buy for Single Product
  const handleDirectUpiBuy = (product) => {
    if (!currentUser) {
      alert('Please Sign In first to place an order!')
      navigate('/login')
      return
    }
    const singleItem = [
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: 1,
      },
    ]
    setUpiPayItems(singleItem)
    setUpiPayTotal(Number(product.price))
    setIsUpiModalOpen(true)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 pb-20 md:pb-8 selection:bg-indigo-500 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => {
                setSelectedCategory('All')
                setSelectedBrand('All')
                setSearchQuery('')
                setPage(1)
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Shop<span className="text-indigo-400">Ease</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full ml-1">
                    2.0
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider hidden sm:block">
                  2,400+ VERIFIED PRODUCTS
                </span>
              </div>
            </div>

            {/* Delivery Location badge */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 max-w-[190px] truncate bg-slate-800/60 px-3 py-1.5 rounded-2xl border border-slate-700/50">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <p className="text-[9px] text-slate-400 uppercase font-bold">Deliver to</p>
                <p className="font-semibold text-white truncate">
                  {currentUser ? `${currentUser.name}` : 'Kolkata, WB'}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-1 sm:mx-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search 2,400+ products (iPhone 16, Vivo, Prestige, Nike...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 text-white pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700/70 placeholder-slate-400 transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Connect UPI Quick Button */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayItems(cart.length > 0 ? cart : products.slice(0, 1))
                    setUpiPayTotal(cartTotal || 1999)
                    setIsUpiModalOpen(true)
                  }}
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Connect UPI</span>
                </button>
              )}

              {/* User Profile / Login */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <Link to="/orders" className="text-[10px] text-indigo-400 hover:underline">
                      My Orders
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition active:scale-95"
                >
                  Sign In
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition border border-slate-700 flex items-center justify-center shadow-md active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. INTERACTIVE STORY CATEGORY BUBBLES (Flipkart/Instagram Carousel) */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm py-3 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Sparkles
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedBrand('All')
                  setPage(1)
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white scale-105 ring-4 ring-indigo-200 shadow-indigo-500/20'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-102'
                  }`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold truncate max-w-[80px] text-center ${
                    isSelected ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {cat}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. HERO TICKER & FLASH DEALS COUNTDOWN BANNER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4">
        {/* Live Buyer Flash Ticker */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-orange-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Live Trend
            </span>
            <span>🔥 48 buyers purchased Vivo, iPhone & Hawkins with UPI in the last 15 mins!</span>
          </div>

          {/* Flash Deals Timer */}
          <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>
              Sale Ends In: {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* UPI Cashback & Dosti Deal Promo Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                UPI Instant Offer
              </span>
              <h3 className="text-base font-extrabold mt-1">Get Flat ₹100 Cashback on UPI</h3>
              <p className="text-xs text-emerald-100">Pay via Google Pay, PhonePe, Paytm or BHIM QR</p>
            </div>
            <button
              onClick={() => {
                setUpiPayItems(products.slice(0, 1))
                setUpiPayTotal(products[0]?.price || 1999)
                setIsUpiModalOpen(true)
              }}
              className="px-3.5 py-2 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition active:scale-95"
            >
              Connect UPI
            </button>
          </div>

          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Social Commerce 👥
              </span>
              <h3 className="text-base font-extrabold mt-1">Dosti Deal: Flat 12% Off</h3>
              <p className="text-xs text-indigo-100">Invite a friend on WhatsApp & unlock group discounts</p>
            </div>
            <button
              onClick={() => {
                if (products.length > 0) setDostiProduct(products[0])
              }}
              className="px-3.5 py-2 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-300 transition active:scale-95 flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" /> Try Deal
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCT CATALOG & FILTERS */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-5">
        {/* Brand bar and Sort Options */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80 mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Brands:
            </span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedBrand(b)
                  setPage(1)
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  selectedBrand === b
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-500 font-medium">
              Showing <b className="text-slate-800">{totalCount.toLocaleString()}</b> items
            </span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Deals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated (4★+)</option>
                <option value="discount">Biggest Discount %</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid (Interactive, Responsive & Rich) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 animate-pulse space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 my-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products match your query</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different brand or search keyword</p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedBrand('All')
                setSearchQuery('')
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((item) => {
              const isCompared = compareList.some((p) => p.id === item.id)

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative cursor-pointer"
                  onClick={() => setDetailProduct(item)}
                >
                  {/* Top Badges */}
                  <div className="p-3 pb-0 flex items-center justify-between gap-1 z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {item.brand}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Image Container with Zoom */}
                  <div className="relative p-4 flex items-center justify-center bg-gradient-to-b from-transparent to-slate-50/50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-36 sm:h-44 w-auto object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-md rounded-xl"
                      loading="lazy"
                    />

                    {/* Quick View Pill on Hover */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-white/95 text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                        Tap for Specs & Details 🔍
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-3 sm:p-4 pt-1 flex flex-col flex-1 justify-between space-y-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          <span>{item.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({Number(item.reviews_count || 1200).toLocaleString()})
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        {item.original_price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{Number(item.original_price).toLocaleString('en-IN')}
                          </span>
                        )}
                        {item.discount && (
                          <span className="text-[10px] font-extrabold text-emerald-600">
                            {item.discount}
                          </span>
                        )}
                      </div>

                      {/* Dosti Deal mini badge */}
                      {item.group_price && (
                        <div className="mt-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold flex items-center justify-between border border-amber-200/60">
                          <span>Dosti Deal:</span>
                          <span className="font-extrabold">₹{Number(item.group_price).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(item)
                          }}
                          className="py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Cart
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDirectUpiBuy(item)
                          }}
                          className="py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-[11px] rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-sm shadow-emerald-600/20"
                        >
                          <Zap className="w-3 h-3 text-amber-300" /> UPI Pay
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCompare(item)
                          }}
                          className={`py-1 rounded-xl text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                            isCompared
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Layers className="w-3 h-3" /> {isCompared ? 'Compared' : 'VS Compare'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDostiProduct(item)
                          }}
                          className="py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <Users className="w-3 h-3 text-amber-600" /> Dosti Deal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* 5. FLOATING VS COMPARE DOCK */}
      {compareList.length > 0 && (
        <div className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">
              {compareList.length} / 3 Items Selected for Comparison
            </span>
          </div>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full text-xs font-extrabold shadow-md transition active:scale-95"
          >
            Open VS Compare
          </button>
          <button
            onClick={() => setCompareList([])}
            className="text-slate-400 hover:text-white p-1"
            title="Clear list"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-4 flex items-center justify-around">
        <button
          onClick={() => {
            setSelectedCategory('All')
            setSelectedBrand('All')
            setPage(1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex flex-col items-center text-slate-700 hover:text-indigo-600"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Shop</span>
        </button>

        <button
          onClick={() => {
            if (compareList.length > 0) setIsCompareOpen(true)
            else alert('Select at least 1 product using "VS Compare" to view comparisons!')
          }}
          className="flex flex-col items-center text-slate-700 hover:text-indigo-600 relative"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">VS Compare</span>
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {compareList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setUpiPayItems(cart.length > 0 ? cart : products.slice(0, 1))
            setUpiPayTotal(cartTotal || 1999)
            setIsUpiModalOpen(true)
          }}
          className="flex flex-col items-center text-emerald-700 hover:text-emerald-800"
        >
          <div className="w-8 h-8 -mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">UPI Pay</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center text-slate-700 hover:text-indigo-600 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItemsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center text-slate-700 hover:text-indigo-600"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </button>
      </div>

      {/* 7. CART DRAWER WITH UPI CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Your Cart ({totalItemsCount} items)</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-sm">Your cart is empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-xl bg-white p-1" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* UPI Instant Checkout */}
                  <button
                    onClick={handleCheckoutWithUpi}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300" /> Pay with UPI (GPay/PhonePe/QR)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MODALS & INNOVATIVE FEATURES */}
      {/* Product Detail Modal (Deep specs & mobile view) */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addToCart}
        onOpenCompare={toggleCompare}
        onOpenDosti={(p) => setDostiProduct(p)}
        onDirectUpiBuy={handleDirectUpiBuy}
      />

      {/* UPI Payment Modal (Connect UPI / QR / Bank) */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        totalAmount={upiPayTotal}
        currentUser={currentUser}
        cartItems={upiPayItems}
        onPaymentSuccess={(order) => {
          setPlacedOrder(order)
          setCart([])
        }}
      />

      {/* VS Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={compareList}
        onAddToCart={addToCart}
      />

      {/* Dosti Deal (Group Buying) Modal */}
      <DostiDealModal
        product={dostiProduct}
        isOpen={Boolean(dostiProduct)}
        onClose={() => setDostiProduct(null)}
        onJoinDeal={addDostiToCart}
      />

      {/* Delivery Welcome Animation upon Login/Registration */}
      {showWelcome && (
        <DeliveryWelcomeAnimation
          user={currentUser}
          onComplete={() => {
            setShowWelcome(false)
            sessionStorage.removeItem('showWelcomeAnimation')
          }}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-slate-700 animate-slide-up flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Order Placed Success Banner */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Order #{placedOrder.orderNumber}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Payment:</span>
                <span className="font-bold text-emerald-700">UPI Verified (100% Paid)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Delivery Date:</span>
                <span className="font-bold text-slate-900">{placedOrder.deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Amount:</span>
                <span className="font-extrabold text-slate-900">₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  setPlacedOrder(null)
                  navigate('/orders')
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop
