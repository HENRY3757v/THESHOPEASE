import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Tag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Package,
  ArrowUpDown,
  Sparkles,
  Users,
  ArrowRight
} from 'lucide-react'

import DeliveryWelcomeAnimation from '../components/DeliveryWelcomeAnimation'
import CompareModal from '../components/CompareModal'
import DostiDealModal from '../components/DostiDealModal'

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

  // Innovative Features States: VS Compare & Dosti Deal
  const [compareList, setCompareList] = useState([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [dostiProduct, setDostiProduct] = useState(null)

  // Cart & Order states
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  // Load User
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

  // Load Brands dynamically for the selected category
  useEffect(() => {
    const url = selectedCategory && selectedCategory !== 'All'
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
      setPage(1) // Reset to page 1 on new search
    }, 350)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch 10,000 products with pagination & filters
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
    setNotification(`Added "${product.name.slice(0, 22)}..." to cart!`)
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
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      }
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

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Please Sign In first to place an order!')
      navigate('/login')
      return
    }

    if (cart.length === 0) return

    setIsPlacingOrder(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userPhone: currentUser.phone,
          shippingAddress: currentUser.address,
          items: cart,
          totalAmount: cartTotal,
          deliveryDays: 2,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setPlacedOrder(data.order)
        setCart([])
        setIsCartOpen(false)
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (err) {
      alert('Failed to connect to backend server on port 5000.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* 1. TOP NAVBAR (Amazon/Flipkart Style) */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSelectedCategory('All')
              setSearchQuery('')
              setPage(1)
            }}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="hidden sm:block leading-none">
                <span className="text-xl font-bold tracking-tight text-white">
                  Shop<span className="text-indigo-400">Ease</span>
                </span>
                <span className="block text-[10px] text-amber-400 font-semibold tracking-wider">
                  10,000+ PRODUCTS
                </span>
              </div>
            </div>

            {/* Delivery Location badge */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 max-w-[180px] truncate">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Deliver to</p>
                <p className="font-semibold text-white truncate">
                  {currentUser ? `${currentUser.name} (${currentUser.address?.split(',')[0] || 'Home'})` : 'Select address'}
                </p>
              </div>
            </div>

            {/* Search Bar (Real-time live query across 10,000 products) */}
            <div className="flex-1 max-w-xl mx-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search across 10,000 products (iPhone, Nike, Sony, Laptops...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-slate-900 pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-3">
              {/* Returns & Orders */}
              <button
                onClick={() => navigate('/orders')}
                className="hidden sm:flex flex-col text-left text-xs text-slate-300 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                <span className="text-[10px] text-slate-400">Returns</span>
                <span className="font-bold text-white">& Orders</span>
              </button>

              {/* User Account / Login */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-medium">Hello,</p>
                    <p className="text-xs font-bold text-amber-400 leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition"
                >
                  Sign In
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs uppercase font-bold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5" /> Department:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedBrand('All')
                setPage(1)
              }}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* BRAND FILTER BAR (Flipkart / Amazon Style) */}
        {brands.length > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] uppercase font-bold text-slate-400 mr-2 shrink-0">
              Popular Brands:
            </span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedBrand(b)
                  setPage(1)
                }}
                className={`px-3 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedBrand === b
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. WELCOME HERO BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow">
              <Sparkles className="w-3.5 h-3.5" /> Live MySQL Database: 10,000 Products Available
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome {currentUser ? currentUser.name : 'Shopper'}! 👋
            </h2>
            <p className="mt-2 text-indigo-100 text-xs sm:text-sm">
              Explore 10,000+ items across Mobiles, Laptops, Electronics, Fashion, Footwear, Gaming & more. Instant dispatch with fast delivery.
            </p>
          </div>
          <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none hidden sm:block">
            <ShoppingBag className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4. CONTROLS BAR: Count, Filters & Sort */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>
                {selectedCategory === 'All' ? 'All Products Catalog' : `${selectedCategory}`}
                {selectedBrand !== 'All' ? ` — ${selectedBrand}` : ''}
              </span>
              {debouncedSearch && (
                <span className="text-xs text-indigo-600 font-normal">matching &quot;{debouncedSearch}&quot;</span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong>{products.length}</strong> of <strong>{totalCount.toLocaleString()}</strong> items (Page {page} of {totalPages})
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="featured">Featured / Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* 5. PRODUCT LISTING GRID */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Querying MySQL database across 10,000 products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No matching products found!</h4>
            <p className="text-xs text-slate-400 mt-1">Try searching for something else or pick another category.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedBrand('All')
                setPage(1)
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-slate-50 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                      {product.badge}
                    </span>
                  )}

                  {/* VS COMPARE BUTTON */}
                  <button
                    onClick={() => toggleCompare(product)}
                    className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md transition cursor-pointer backdrop-blur-xs ${
                      compareList.some((c) => c.id === product.id)
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : 'bg-white/90 text-slate-700 hover:bg-white hover:text-indigo-600'
                    }`}
                    title="Compare specifications side-by-side"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    {compareList.some((c) => c.id === product.id) ? 'Comparing' : 'VS Compare'}
                  </button>

                  <span className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-600 uppercase tracking-wider truncate">
                        {product.category} &bull; {product.brand}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">#{product.id}</span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2" title={product.name}>
                      {product.name}
                    </h4>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {product.rating} <Star className="w-2.5 h-2.5 fill-white" />
                      </span>
                      <span className="text-xs text-slate-400">({product.reviews_count?.toLocaleString() || 120})</span>
                    </div>

                    {/* Pricing */}
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-slate-900">₹{Number(product.price).toLocaleString()}</span>
                        <span className="text-xs text-slate-400 line-through">₹{Number(product.original_price).toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-emerald-600">{product.discount}</span>
                      </div>
                      {product.group_price && (
                        <div className="mt-1.5 flex items-center justify-between bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
                          <span className="text-[10px] text-amber-900 font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-amber-600" /> Dosti Deal:
                          </span>
                          <span className="text-xs font-black text-amber-950">
                            ₹{Number(product.group_price).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Free Delivery in {product.delivery_days} {product.delivery_days === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Buy Solo vs Dosti Deal */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" /> Buy Solo
                    </button>
                    <button
                      onClick={() => setDostiProduct(product)}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3 h-3" /> Dosti Deal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. PAGINATION BAR (Navigating 10,000 items) */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{page}</strong> of <strong>{totalPages.toLocaleString()}</strong> ({totalCount.toLocaleString()} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers snippet */}
              <div className="flex items-center gap-1">
                {[page - 1, page, page + 1, page + 2]
                  .filter((p) => p >= 1 && p <= totalPages)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        page === p
                          ? 'bg-indigo-600 text-white shadow'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 7. SHOPPING CART SIDEBAR DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Your Shopping Cart ({totalItemsCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Your cart is currently empty!</p>
                  <p className="text-xs text-slate-400 mt-1">Browse our 10,000 products to add items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">₹{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer / Checkout summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                {currentUser && (
                  <div className="text-xs bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg text-indigo-900">
                    <p className="font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Shipping Address:
                    </p>
                    <p className="text-slate-600 mt-0.5 truncate">{currentUser.address}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal ({totalItemsCount} items):</span>
                  <span className="font-extrabold text-lg text-slate-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isPlacingOrder}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    'Proceed to Buy (Place Order)'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. ORDER CONFIRMATION MODAL */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Order Placed Successfully! 🎉</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your order is recorded directly into MySQL database <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono">shopify_db.orders</code>
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-semibold text-slate-900">{placedOrder.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Paid:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{Number(placedOrder.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Estimated Delivery:
                </span>
                <span>{new Date(placedOrder.deliveryDate).toDateString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPlacedOrder(null)
                  navigate('/orders')
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow"
              >
                View in My Orders
              </button>
              <button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition"
              >
                Keep Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DELIVERY WELCOME ANIMATION (Triggered on Login / Registration) */}
      {showWelcome && (
        <DeliveryWelcomeAnimation
          user={currentUser}
          onComplete={() => {
            setShowWelcome(false)
            sessionStorage.removeItem('showWelcomeAnimation')
          }}
        />
      )}

      {/* 10. FLOATING COMPARISON DOCK (Idea 2: 1-Click VS Mode) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold">
              <strong>{compareList.length}</strong> {compareList.length === 1 ? 'item' : 'items'} selected for comparison
            </span>
          </div>
          <button
            onClick={() => setCompareList([])}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
          >
            Compare Now (VS) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 11. VS SPEC COMPARISON MODAL */}
      {isCompareOpen && (
        <CompareModal
          products={compareList}
          onClose={() => setIsCompareOpen(false)}
          onAddToCart={(product) => {
            addToCart(product)
            setIsCompareOpen(false)
          }}
        />
      )}

      {/* 12. DOSTI DEAL (GROUP BUYING) MODAL */}
      {dostiProduct && (
        <DostiDealModal
          product={dostiProduct}
          onClose={() => setDostiProduct(null)}
          onAddDostiToCart={(product) => addDostiToCart(product)}
        />
      )}
    </div>
  )
}

export default Shop
