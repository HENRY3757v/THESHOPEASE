import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  MapPin,
  Star,
  LogOut,
  X,
  Plus,
  Minus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpDown,
  Sparkles,
  Users,
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
  Heart,
  Tablet,
  Camera,
  Tv,
  Snowflake,
  Wind,
  Flame,
  BadgePercent,
  Store,
  Sofa,
  Gem,
  ShoppingBasket,
  Car,
  ExternalLink,
  Globe,
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
  'Home & Decor': Sofa,
  Electronics: Headphones,
  Headphones: Headphones,
  Tablets: Tablet,
  Cameras: Camera,
  Smartwatches: Watch,
  Watches: Watch,
  TVs: Tv,
  Refrigerators: Snowflake,
  'Washing Machines': Wind,
  'Air Conditioners': Snowflake,
  Gaming: Gamepad2,
  Fashion: Shirt,
  Footwear: Footprints,
  'Beauty & Care': Sparkles,
  'Jewellery & Eyewear': Gem,
  Groceries: ShoppingBasket,
  'Sports & Auto': Car,
}

const CATEGORY_GRADIENTS = {
  All: {
    active: 'from-slate-800 to-slate-950 shadow-slate-500/30',
    idle: 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50',
    iconBg: 'bg-slate-100 text-slate-700',
  },
  Mobiles: {
    active: 'from-blue-600 to-indigo-600 shadow-blue-500/30',
    idle: 'border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50/70',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  Laptops: {
    active: 'from-violet-600 to-purple-700 shadow-violet-500/30',
    idle: 'border-violet-200 text-violet-700 hover:border-violet-400 hover:bg-violet-50/70',
    iconBg: 'bg-violet-50 text-violet-600',
  },
  Headphones: {
    active: 'from-pink-500 to-rose-600 shadow-pink-500/30',
    idle: 'border-pink-200 text-pink-700 hover:border-pink-400 hover:bg-pink-50/70',
    iconBg: 'bg-pink-50 text-pink-600',
  },
  Electronics: {
    active: 'from-pink-500 to-rose-600 shadow-pink-500/30',
    idle: 'border-pink-200 text-pink-700 hover:border-pink-400 hover:bg-pink-50/70',
    iconBg: 'bg-pink-50 text-pink-600',
  },
  Tablets: {
    active: 'from-cyan-500 to-blue-600 shadow-cyan-500/30',
    idle: 'border-cyan-200 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-50/70',
    iconBg: 'bg-cyan-50 text-cyan-600',
  },
  Cameras: {
    active: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    idle: 'border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50/70',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  Smartwatches: {
    active: 'from-emerald-500 to-teal-700 shadow-emerald-500/30',
    idle: 'border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/70',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  Watches: {
    active: 'from-emerald-500 to-teal-700 shadow-emerald-500/30',
    idle: 'border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/70',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  TVs: {
    active: 'from-red-500 to-rose-700 shadow-red-500/30',
    idle: 'border-red-200 text-red-700 hover:border-red-400 hover:bg-red-50/70',
    iconBg: 'bg-red-50 text-red-600',
  },
  Refrigerators: {
    active: 'from-teal-500 to-cyan-700 shadow-teal-500/30',
    idle: 'border-teal-200 text-teal-700 hover:border-teal-400 hover:bg-teal-50/70',
    iconBg: 'bg-teal-50 text-teal-600',
  },
  'Washing Machines': {
    active: 'from-teal-500 to-cyan-700 shadow-teal-500/30',
    idle: 'border-teal-200 text-teal-700 hover:border-teal-400 hover:bg-teal-50/70',
    iconBg: 'bg-teal-50 text-teal-600',
  },
  'Air Conditioners': {
    active: 'from-sky-500 to-cyan-700 shadow-sky-500/30',
    idle: 'border-sky-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50/70',
    iconBg: 'bg-sky-50 text-sky-600',
  },
  'Home & Kitchen': {
    active: 'from-orange-500 to-amber-600 shadow-orange-500/30',
    idle: 'border-orange-200 text-orange-700 hover:border-orange-400 hover:bg-orange-50/70',
    iconBg: 'bg-orange-50 text-orange-600',
  },
  'Home & Decor': {
    active: 'from-amber-600 to-yellow-700 shadow-amber-500/30',
    idle: 'border-amber-200 text-amber-800 hover:border-amber-400 hover:bg-amber-50/70',
    iconBg: 'bg-amber-50 text-amber-700',
  },
  Fashion: {
    active: 'from-fuchsia-500 to-pink-600 shadow-fuchsia-500/30',
    idle: 'border-fuchsia-200 text-fuchsia-700 hover:border-fuchsia-400 hover:bg-fuchsia-50/70',
    iconBg: 'bg-fuchsia-50 text-fuchsia-600',
  },
  Footwear: {
    active: 'from-rose-500 to-red-600 shadow-rose-500/30',
    idle: 'border-rose-200 text-rose-700 hover:border-rose-400 hover:bg-rose-50/70',
    iconBg: 'bg-rose-50 text-rose-600',
  },
  'Beauty & Care': {
    active: 'from-rose-400 to-pink-600 shadow-rose-400/30',
    idle: 'border-rose-200 text-rose-700 hover:border-rose-400 hover:bg-rose-50/70',
    iconBg: 'bg-rose-50 text-rose-500',
  },
  'Jewellery & Eyewear': {
    active: 'from-yellow-500 to-amber-600 shadow-yellow-500/30',
    idle: 'border-yellow-300 text-amber-800 hover:border-amber-400 hover:bg-amber-50/70',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  Groceries: {
    active: 'from-lime-600 to-green-700 shadow-lime-500/30',
    idle: 'border-lime-200 text-green-700 hover:border-lime-400 hover:bg-lime-50/70',
    iconBg: 'bg-lime-50 text-green-700',
  },
  'Sports & Auto': {
    active: 'from-slate-700 to-zinc-900 shadow-slate-500/30',
    idle: 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50',
    iconBg: 'bg-slate-100 text-slate-700',
  },
}

const DEFAULT_CAT_STYLE = {
  active: 'from-indigo-600 to-violet-600 shadow-indigo-500/30',
  idle: 'border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/70',
  iconBg: 'bg-indigo-50 text-indigo-600',
}

function Shop() {
  const navigate = useNavigate()
  const brandScrollRef = useRef(null)
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

  // Innovative Features States: VS Compare, Dosti Deal, Wishlist & Modals
  const [compareList, setCompareList] = useState([])
  const [wishlist, setWishlist] = useState([])
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

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id)
      const next = exists ? prev.filter((id) => id !== product.id) : [...prev, product.id]
      setNotification(
        exists
          ? `Removed "${product.name.slice(0, 22)}..." from wishlist`
          : `♥ Saved "${product.name.slice(0, 22)}..." to wishlist!`
      )
      setTimeout(() => setNotification(''), 2200)
      return next
    })
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
          seller_id: product.seller_id || null,
          seller_name: product.seller_name || null,
          seller_hub: product.seller_hub || null,
          source_site: product.source_site || 'ShopEase Direct',
          external_url: product.external_url || null,
          external_cart_url: product.external_cart_url || null,
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
          seller_id: product.seller_id || null,
          seller_name: product.seller_name || null,
          seller_hub: product.seller_hub || null,
          source_site: product.source_site || 'ShopEase Direct',
          external_url: product.external_url || null,
          external_cart_url: product.external_cart_url || null,
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
        seller_id: product.seller_id || null,
        seller_name: product.seller_name || null,
        seller_hub: product.seller_hub || null,
        source_site: product.source_site || 'ShopEase Direct',
        external_url: product.external_url || null,
        external_cart_url: product.external_cart_url || null,
      },
    ]
    setUpiPayItems(singleItem)
    setUpiPayTotal(Number(product.price))
    setIsUpiModalOpen(true)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const scrollBrands = (direction) => {
    if (brandScrollRef.current) {
      brandScrollRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth',
      })
    }
  }

  // Smart 5-page pagination window
  const getPageNumbers = () => {
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-800 pb-24 md:pb-12 selection:bg-indigo-500 selection:text-white">
      {/* 1. PREMIUM GLASSMORPHIC TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl text-white shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px] gap-2 sm:gap-4">
            {/* Brand Logo with Accent Strip */}
            <div
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 pl-2.5 border-l-4 border-indigo-500 rounded-l-sm"
              onClick={() => {
                setSelectedCategory('All')
                setSelectedBrand('All')
                setSearchQuery('')
                setPage(1)
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1">
                  <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                    Shop
                  </span>
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Ease
                  </span>
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full ml-1 shadow">
                    2.0
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider hidden sm:block mt-0.5">
                  ORIGINAL PICS • SELLER MARKETPLACE
                </span>
              </div>
            </div>

            {/* Delivery Location Badge */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 max-w-[185px] truncate bg-white/5 hover:bg-white/10 transition px-3 py-1.5 rounded-2xl border border-white/10">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Deliver to</p>
                <p className="font-semibold text-white truncate">
                  {currentUser ? `${currentUser.name}` : 'Kolkata, WB'}
                </p>
              </div>
            </div>

            {/* Prominent Search Bar */}
            <div className="flex-1 max-w-xl mx-1 sm:mx-2">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search iPhone 16, Vivo, MacBook, Sony, LG..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 pl-10 sm:pl-11 pr-9 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-slate-400 transition"
                />
                <Search className="w-4 h-4 text-indigo-600 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Sell on ShopEase CTA Button */}
              <Link
                to="/seller"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-full shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Sell (₹20/day)</span>
              </Link>

              {/* Connect UPI Quick Button */}
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setUpiPayItems(cart.length > 0 ? cart : products.slice(0, 1))
                    setUpiPayTotal(cartTotal || 1999)
                    setIsUpiModalOpen(true)
                  }}
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg shadow-emerald-500/25 transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Connect UPI</span>
                </button>
              )}

              {/* User Profile / Login */}
              {currentUser ? (
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-black text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left pr-1">
                    <p className="text-xs font-bold text-white leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <Link to="/orders" className="text-[10px] text-indigo-300 hover:text-indigo-200 font-semibold hover:underline">
                      My Orders
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs px-4 py-2 rounded-full shadow-lg shadow-indigo-500/30 transition active:scale-95"
                >
                  Sign In
                </button>
              )}

              {/* Cart Button with Glow Ring when populated */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition flex items-center justify-center shadow-lg active:scale-95 ${
                  totalItemsCount > 0
                    ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
                    : 'border border-white/15'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. COLORFUL PILL CATEGORY BAR */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3 px-2 sm:px-6 sticky top-16 sm:top-[70px] z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Sparkles
            const isSelected = selectedCategory === cat
            const style = CATEGORY_GRADIENTS[cat] || DEFAULT_CAT_STYLE
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedBrand('All')
                  setPage(1)
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold flex-shrink-0 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${style.active} text-white border-transparent shadow-lg scale-105`
                    : `bg-white ${style.idle}`
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : style.iconBg
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="whitespace-nowrap">{cat}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. PREMIUM HERO BANNER & PROMO STRIP */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-5 space-y-4">
        {/* Flash Sale Gradient Hero Banner with Digital Clock */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-900 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10">
          {/* Decorative background glow orbs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Left Copy */}
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-amber-300 border border-white/15">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Live Flash Deal • 48 buyers checked out recently</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                India&apos;s Biggest{' '}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                  Flash Sale
                </span>{' '}
                🔥
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium">
                Save up to <span className="font-black text-amber-300">80% today</span> on Flagship Phones, Laptops, TVs &amp; Direct Brand Stores — 100% Authentic GST Invoice.
              </p>
            </div>

            {/* Center Digital Clock Countdown */}
            <div className="flex flex-col items-start sm:items-center bg-black/30 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" /> Deal Ends In
              </span>
              <div className="flex items-center gap-2 font-mono">
                <div className="bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-sans font-bold">Hrs</p>
                </div>
                <span className="text-xl font-black text-amber-400 animate-pulse">:</span>
                <div className="bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-sans font-bold">Min</p>
                </div>
                <span className="text-xl font-black text-amber-400 animate-pulse">:</span>
                <div className="bg-slate-950/90 border border-white/15 rounded-xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                  <span className="text-xl sm:text-2xl font-black text-amber-300">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <p className="text-[9px] text-slate-400 uppercase font-sans font-bold">Sec</p>
                </div>
              </div>
            </div>

            {/* Right Decorative Badge Stack (Desktop) */}
            <div className="hidden xl:flex flex-col gap-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-white">100% Brand Direct</p>
                  <p className="text-[10px] text-indigo-200">Official Warranty &amp; QR</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                <TrendingUp className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-white">Zero Hidden Fees</p>
                  <p className="text-[10px] text-indigo-200">Instant UPI Cashback</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UPI Cashback & Dosti Deal Glassmorphic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-3 border border-white/15">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] bg-emerald-950/50 border border-white/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-emerald-200">
                    UPI Instant Offer
                  </span>
                  <h3 className="text-sm sm:text-base font-black mt-1">Flat ₹100 Cashback on UPI</h3>
                  <p className="text-[11px] text-emerald-100">GPay, PhonePe, Paytm &amp; BHIM QR ready</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUpiPayItems(products.slice(0, 1))
                  setUpiPayTotal(products[0]?.price || 1999)
                  setIsUpiModalOpen(true)
                }}
                className="px-4 py-2.5 bg-white text-emerald-800 font-black text-xs rounded-2xl shadow-lg hover:bg-emerald-50 transition active:scale-95 shrink-0 cursor-pointer"
              >
                Connect UPI
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-700 to-purple-800 text-white rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-3 border border-white/15">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] bg-indigo-950/50 border border-white/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-indigo-200">
                    Social Commerce 👥
                  </span>
                  <h3 className="text-sm sm:text-base font-black mt-1">Dosti Deal: Flat 12% Extra Off</h3>
                  <p className="text-[11px] text-indigo-100">Share with friends &amp; unlock group prices</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (products.length > 0) setDostiProduct(products[0])
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:from-amber-200 hover:to-amber-300 transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <BadgePercent className="w-4 h-4" /> Try Deal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN PRODUCT CATALOG & FILTERS */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6">
        {/* Brand Filter Bar with Scroll Arrows + Sort */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80 mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Scrollable Brand Chips with Arrows */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider shrink-0">
              Brands:
            </span>
            <button
              type="button"
              onClick={() => scrollBrands('left')}
              className="hidden md:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-600 shrink-0 transition"
              aria-label="Scroll brands left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={brandScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 scroll-smooth"
            >
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBrand(b)
                    setPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedBrand === b
                      ? 'bg-slate-900 text-white shadow-md scale-102'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBrands('right')}
              className="hidden md:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 items-center justify-center text-slate-600 shrink-0 transition"
              aria-label="Scroll brands right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/70">
              Showing <b className="text-slate-900">{totalCount.toLocaleString()}</b> products
            </span>
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/70 rounded-full px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  setPage(1)
                }}
                className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer"
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

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 animate-pulse space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                <div className="h-9 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-slate-200 my-8">
            <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-slate-800">No products match your query</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different category, brand or keyword</p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedBrand('All')
                setSearchQuery('')
              }}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-md transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map((item) => {
              const isCompared = compareList.some((p) => p.id === item.id)
              const isWishlisted = wishlist.includes(item.id)

              return (
                <div
                  key={item.id}
                  onClick={() => setDetailProduct(item)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative cursor-pointer"
                >
                  {/* Top Badges Row */}
                  <div className="px-3 pt-3 pb-1 flex items-center justify-between gap-1 z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {item.brand}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-extrabold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-2.5 py-0.5 rounded-full shadow-sm truncate max-w-[115px]">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Image Container with Subtle Gradient Stage + Wishlist Heart */}
                  <div className="relative px-4 py-4 flex items-center justify-center bg-gradient-to-b from-white to-slate-50/90 border-b border-slate-100">
                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(item)
                      }}
                      aria-label="Toggle wishlist"
                      className={`absolute top-2 right-2.5 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-100 flex items-center justify-center transition-all duration-200 ${
                        isWishlisted
                          ? 'opacity-100 text-rose-500 scale-105'
                          : 'opacity-85 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 sm:h-48 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm rounded-xl"
                      loading="lazy"
                    />

                    {/* Quick View Pill on Hover */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2.5 pointer-events-none">
                      <span className="bg-white/95 text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg border border-slate-200">
                        Quick View &amp; Specs 🔍
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          <span>{item.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({Number(item.reviews_count || 1200).toLocaleString()} reviews)
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        {item.original_price && (
                          <span className="text-[11px] text-slate-400 line-through font-medium">
                            ₹{Number(item.original_price).toLocaleString('en-IN')}
                          </span>
                        )}
                        {item.discount && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            {item.discount}
                          </span>
                        )}
                      </div>

                      {/* Dosti Deal Pill */}
                      {item.group_price && (
                        <div className="text-[10px] text-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 rounded-lg font-bold flex items-center justify-between border border-amber-200/80">
                          <span>👥 Dosti Deal</span>
                          <span className="font-black text-amber-900">
                            ₹{Number(item.group_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {/* Brand Direct & Source Website Tag */}
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500">
                        <span className="text-blue-600 font-extrabold flex items-center gap-0.5 truncate">
                          ✓ {item.source_site || 'Brand Direct'}
                        </span>
                        {item.external_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              fetch(`${API_BASE_URL}/api/bridge/redirect`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  userId: currentUser?.id || null,
                                  productId: item.id,
                                  sourceSite: item.source_site || 'Partner Store',
                                  targetUrl: item.external_url,
                                  actionType: 'view_store',
                                }),
                              }).catch(() => {})
                              window.open(item.external_url, '_blank', 'noopener,noreferrer')
                            }}
                            className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-bold shrink-0 cursor-pointer"
                            title="Open Original Website"
                          >
                            <Globe className="w-2.5 h-2.5" /> Store <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(item)
                          }}
                          className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDirectUpiBuy(item)
                          }}
                          className="py-2 px-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-extrabold text-[11px] rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" /> Buy with UPI
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCompare(item)
                          }}
                          className={`py-1.5 rounded-xl text-[10px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                            isCompared
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Layers className="w-3 h-3" /> {isCompared ? 'Added ✓' : 'VS Compare'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDostiProduct(item)
                          }}
                          className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
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

        {/* Numbered Pill Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-2 rounded-full shadow-lg border border-slate-200/80">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPage(pageNum)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-extrabold transition flex items-center justify-center cursor-pointer ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 5. FLOATING VS COMPARE DOCK */}
      {compareList.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl border border-indigo-500/40 flex items-center gap-4 animate-bounce-subtle">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold whitespace-nowrap">
              {compareList.length} / 3 Selected
            </span>
          </div>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full text-xs font-extrabold shadow-md transition active:scale-95 whitespace-nowrap"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-2 px-4 flex items-center justify-around">
        <button
          onClick={() => {
            setSelectedCategory('All')
            setSelectedBrand('All')
            setPage(1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex flex-col items-center text-indigo-600 relative"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mb-0.5" />
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-extrabold mt-0.5">Shop</span>
        </button>

        <button
          onClick={() => {
            if (compareList.length > 0) setIsCompareOpen(true)
            else alert('Select at least 1 product using "VS Compare" to view comparisons!')
          }}
          className="flex flex-col items-center text-slate-600 hover:text-indigo-600 relative"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Compare</span>
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
          <div className="w-11 h-11 -mt-6 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40 ring-4 ring-white">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <span className="text-[10px] font-extrabold mt-0.5">UPI Pay</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center text-slate-600 hover:text-indigo-600 relative"
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
          onClick={() => navigate('/seller')}
          className="flex flex-col items-center text-amber-600 hover:text-amber-700"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-extrabold mt-0.5">Sell</span>
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center text-slate-600 hover:text-indigo-600"
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Orders</span>
        </button>
      </div>

      {/* 7. CART DRAWER WITH UPI CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Indigo Gradient Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">Your Shopping Cart</h3>
                  <p className="text-[11px] text-indigo-100">{totalItemsCount} items ready for checkout</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/70">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-slate-700 font-bold text-base">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Explore 425+ real verified products</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-xs font-extrabold shadow-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex gap-3.5 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1.5 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2">{item.name}</h4>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-sm font-black text-indigo-700">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        {item.external_url && (
                          <a
                            href={item.external_cart_url || item.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            {item.source_site || 'Original Site'} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200"
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
              <div className="p-5 bg-white border-t border-slate-200 space-y-3 shadow-inner">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-bold">Total Payable Amount</span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleCheckoutWithUpi}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" /> Pay with UPI (GPay / PhonePe / QR)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MODALS & INNOVATIVE FEATURES */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onAddToCart={addToCart}
        onOpenCompare={toggleCompare}
        onOpenDosti={(p) => setDostiProduct(p)}
        onDirectUpiBuy={handleDirectUpiBuy}
        currentUser={currentUser}
      />

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

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={compareList}
        onAddToCart={addToCart}
      />

      <DostiDealModal
        product={dostiProduct}
        isOpen={Boolean(dostiProduct)}
        onClose={() => setDostiProduct(null)}
        onJoinDeal={addDostiToCart}
      />

      {showWelcome && (
        <DeliveryWelcomeAnimation
          user={currentUser}
          onComplete={() => {
            setShowWelcome(false)
            sessionStorage.removeItem('showWelcomeAnimation')
          }}
        />
      )}

      {/* Stylish Toast Notification */}
      {notification && (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 bg-slate-900/95 backdrop-blur-md text-white pl-3 pr-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border border-slate-700 border-l-4 border-l-emerald-400 animate-slide-up flex items-center gap-2.5 max-w-xs">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="truncate">{notification}</span>
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
