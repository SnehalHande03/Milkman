import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)
  const [isSignup, setIsSignup] = useState(false)
  const [currentView, setView] = useState('dashboard')
  const [stats, setStats] = useState({ customers: 0, products: 0, categories: 0 })
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || [])
  const [orderSummary, setOrderSummary] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [checkoutError, setCheckoutError] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'staff' })
  const [error, setError] = useState('')
  const [adminData, setAdminData] = useState(null)

  const API_BASE = "" // use dev proxy base
 

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    const endpoint = isSignup ? '/staff/signup/' : '/staff/login/'
    const payload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData)
    }
    try {
      let res = await fetch(`${API_BASE}${endpoint}`, payload)
      if (!res.ok && API_BASE === '') {
        // Fallback to direct backend origin if proxy is misconfigured
        res = await fetch(`http://127.0.0.1:8000${endpoint}`, payload)
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        if (isSignup) {
          setIsSignup(false)
          setError('Signup successful! Please login.')
        } else {
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser(data.user)
          setIsAuthenticated(true)
          setView('products')
          setError('')
        }
      } else {
        setError((data && (data.message || data.detail)) ? `${data.message || data.detail}` : `Auth failed (status ${res.status})`)
      }
    } catch (err) {
      setError(`Connection error: ${err?.message || 'network failed'}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setView('dashboard')
  }

  const handleAddToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      const updated = existing ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }]
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const handleQtyChange = (id, qty) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const handleRemoveFromCart = (id) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id)
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const handleCheckout = async () => {
    if (!user) return
    setCheckoutError(null)
    const payload = {
      user_id: user.id,
      items: cart.map(i => ({ product_id: i.id, quantity: i.qty }))
    }
    try {
      let res = await fetch(`${API_BASE}/order/checkout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok && API_BASE === '') {
        res = await fetch(`http://127.0.0.1:8000/order/checkout/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setOrderSummary(data)
      } else {
        setOrderSummary(null)
        setCheckoutError((data && (data.message || data.detail)) ? `${data.message || data.detail}` : `Checkout failed (status ${res.status})`)
      }
    } catch (e) {
      setCheckoutError(`Connection error: ${e?.message || 'network failed'}`)
    }
  }

  const handlePayment = async (method) => {
    if (!orderSummary) return
    setPaymentError(null)
    try {
      let res = await fetch(`${API_BASE}/order/payment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderSummary.order_id, method })
      })
      if (!res.ok && API_BASE === '') {
        res = await fetch(`http://127.0.0.1:8000/order/payment/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderSummary.order_id, method })
        })
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setPaymentStatus(data.status)
        setCart([])
        localStorage.removeItem('cart')
      } else {
        setPaymentError((data && (data.message || data.detail)) ? `${data.message || data.detail}` : `Payment failed (status ${res.status})`)
      }
    } catch (e) {
      setPaymentError(`Connection error: ${e?.message || 'network failed'}`)
    }
  }

  const loadData = async (view) => {
    if (!isAuthenticated) return
    try {
      if (view === 'dashboard') {
        const [custRes, prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/customer/`).then(r => r.json()),
          fetch(`${API_BASE}/product/`).then(r => r.json()),
          fetch(`${API_BASE}/category/`).then(r => r.json())
        ])
        setStats({
          customers: Array.isArray(custRes) ? custRes.length : 0,
          products: Array.isArray(prodRes) ? prodRes.length : 0,
          categories: Array.isArray(catRes) ? catRes.length : 0
        })
      } else if (view === 'customers') {
        const res = await fetch(`${API_BASE}/customer/`).then(r => r.json())
        setCustomers(Array.isArray(res) ? res : [])
      } else if (view === 'categories') {
        const res = await fetch(`${API_BASE}/category/`).then(r => r.json())
        setCategories(Array.isArray(res) ? res : [])
      } else if (view === 'products') {
        const res = await fetch(`${API_BASE}/product/`).then(r => r.json())
        setProducts(Array.isArray(res) ? res : [])
      } else if (view === 'admin') {
        const res = await fetch(`${API_BASE}/milk-admin/dashboard/`).then(r => r.json())
        setAdminData(res)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData(currentView)
    }
  }, [currentView, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <motion.div 
          className="login-hero"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Milk is always good for health
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Welcome to Milkman Pro. Manage your inventory, customers, and delivery cycles with our modern dashboard.
          </motion.p>
        </motion.div>
        <motion.div 
          className="login-form-side"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="login-card">
            <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
            <form onSubmit={handleAuth}>
              <AnimatePresence mode='wait'>
                {isSignup && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        value={authData.name} 
                        onChange={e => setAuthData({...authData, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select 
                        value={authData.role} 
                        onChange={e => setAuthData({...authData, role: e.target.value})}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #eee' }}
                      >
                        <option value="staff">Customer/Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="+1234567890"
                        value={authData.phone} 
                        onChange={e => setAuthData({...authData, phone: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input 
                        type="text" 
                        placeholder="123 Milk Street"
                        value={authData.address} 
                        onChange={e => setAuthData({...authData, address: e.target.value})}
                        required 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  value={authData.email} 
                  onChange={e => setAuthData({...authData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={authData.password} 
                  onChange={e => setAuthData({...authData, password: e.target.value})}
                  required 
                />
              </div>
              {error && <p style={{ color: error.includes('successful') ? '#4CAF50' : '#e74c3c', marginBottom: '1.5rem', fontWeight: '600' }}>{error}</p>}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="login-btn"
              >
                {isSignup ? 'Register' : 'Log Into Dashboard'}
              </motion.button>
              <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"} 
                <span 
                  onClick={() => { setIsSignup(!isSignup); setError(''); }} 
                  style={{ color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                >
                  {isSignup ? 'Login' : 'Signup'}
                </span>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="App">
      <motion.aside 
        className="sidebar"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="logo-container">
          <h2>Milkman Pro</h2>
          <small style={{ color: 'var(--primary-green)', opacity: 0.7 }}>Role: {user.role.toUpperCase()}</small>
        </div>
        <ul className="nav-links">
          <motion.li 
            whileHover={{ x: 10 }}
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setView('dashboard')}
          >
            <span>🏠</span> Dashboard
          </motion.li>
          {user.role === 'admin' && (
            <>
              <motion.li 
                whileHover={{ x: 10 }}
                className={`nav-item ${currentView === 'customers' ? 'active' : ''}`} 
                onClick={() => setView('customers')}
              >
                <span>👥</span> Customers
              </motion.li>
              <motion.li 
                whileHover={{ x: 10 }}
                className={`nav-item ${currentView === 'categories' ? 'active' : ''}`} 
                onClick={() => setView('categories')}
              >
                <span>📁</span> Categories
              </motion.li>
            </>
          )}
          <motion.li 
            whileHover={{ x: 10 }}
            className={`nav-item ${currentView === 'products' ? 'active' : ''}`} 
            onClick={() => setView('products')}
          >
            <span>🥛</span> Products
          </motion.li>
          <motion.li 
            whileHover={{ x: 10 }}
            className={`nav-item ${currentView === 'cart' ? 'active' : ''}`} 
            onClick={() => setView('cart')}
          >
            <span>🛍️</span> Cart ({cart.reduce((a,i)=>a+i.qty,0)})
          </motion.li>
          {user.role === 'admin' && (
            <motion.li 
              whileHover={{ x: 10 }}
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} 
              onClick={() => setView('admin')} 
              style={{ marginTop: '20px', borderTop: '1px solid #eee' }}
            >
              <span>⚙️</span> Admin Panel
            </motion.li>
          )}
        </ul>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <span className="logout-link" onClick={handleLogout}>Log out</span>
        </div>
      </motion.aside>

      <main className="main-content">
        <motion.div 
          className="top-bar"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div>
            <h3 style={{ color: 'var(--text-light)' }}>Hello, {user.name}</h3>
            <p style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>You are logged in as {user.role === 'admin' ? 'an Administrator' : 'a Customer/Staff'}.</p>
          </div>
          <div className="badge" style={{ animation: 'pulse-green 2s infinite' }}>Active Session</div>
        </motion.div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentView}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {currentView === 'dashboard' && (
              <div>
                <motion.div className="hero-section" variants={itemVariants}>
                  <div className="hero-text">
                    <h2>Milk is always <br/> good for health</h2>
                    <p>Welcome to your personal {user.role} dashboard.</p>
                  </div>
                </motion.div>

                {user.role === 'staff' && (
                  <>
                    <motion.div className="section-title" variants={itemVariants}>
                      <h3>Daily Dairy Insights</h3>
                    </motion.div>
                    <motion.div className="scroll-container" variants={itemVariants}>
                      {[
                        { icon: '💡', title: 'Pro Tip', text: 'Did you know? Drinking a glass of milk before bed helps improve sleep quality.' },
                        { icon: '🥛', title: 'Freshness', text: 'Store your milk in the main body of the fridge, not the door, for consistency.' },
                        { icon: '🧀', title: 'Cheese', text: 'Wrap your cheese in parchment paper instead of plastic to let it breathe.' },
                        { icon: '🧈', title: 'Butter', text: 'Unsalted butter allows you to control the total salt content in your recipes.' }
                      ].map((tip, idx) => (
                        <motion.div key={idx} className="info-card glass-card" whileHover={{ scale: 1.05 }}>
                          <h4>{tip.icon} {tip.title}</h4>
                          <p className="tip-content">{tip.text}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div className="section-title" variants={itemVariants}>
                      <h3>Quick Navigation</h3>
                    </motion.div>
                    <motion.div className="quick-actions-grid" variants={itemVariants}>
                      {[
                        { icon: '🛒', label: 'Browse Products', view: 'products' },
                        { icon: '📊', label: 'My Statistics', view: 'dashboard' },
                        { icon: '📞', label: 'Contact Support' },
                        { icon: '👤', label: 'Update Profile' }
                      ].map((action, idx) => (
                        <motion.div 
                          key={idx} 
                          className="action-card" 
                          whileHover={{ y: -5, backgroundColor: '#4CAF50', color: '#fff' }}
                          onClick={() => action.view && setView(action.view)}
                        >
                          <span className="icon">{action.icon}</span>
                          <span>{action.label}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                    <div style={{ marginBottom: '3rem' }}></div>
                  </>
                )}

                <motion.div className="section-title" variants={itemVariants}>
                  <h3>System Overview</h3>
                </motion.div>
                
                <div className="stats-grid">
                  {user.role === 'admin' && (
                    <motion.div className="stat-card" variants={itemVariants} whileHover={{ y: -10 }}>
                      <div className="icon-circle">👥</div>
                      <h3>Total Customers</h3>
                      <div className="value">{stats.customers}</div>
                    </motion.div>
                  )}
                  <motion.div className="stat-card" variants={itemVariants} whileHover={{ y: -10 }}>
                    <div className="icon-circle">🥛</div>
                    <h3>Total Products</h3>
                    <div className="value">{stats.products}</div>
                  </motion.div>
                  {user.role === 'admin' && (
                    <motion.div className="stat-card" variants={itemVariants} whileHover={{ y: -10 }}>
                      <div className="icon-circle">📁</div>
                      <h3>Total Categories</h3>
                      <div className="value">{stats.categories}</div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {currentView === 'customers' && user.role === 'admin' && (
              <motion.div variants={itemVariants}>
                <div className="section-title">
                  <h3>Customer Directory</h3>
                </div>
                <div className="data-container glass-card">
                  <table>
                    <thead>
                      <tr><th>Full Name</th><th>Email</th><th>Phone</th></tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {currentView === 'categories' && user.role === 'admin' && (
              <motion.div variants={itemVariants}>
                <div className="section-title">
                  <h3>Product Categories</h3>
                </div>
                <div className="data-container glass-card">
                  <table>
                    <thead>
                      <tr><th>Category Name</th><th>Description</th></tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, i) => (
                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <td>{cat.name}</td>
                          <td>{cat.description}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {currentView === 'products' && (
              <motion.div variants={itemVariants}>
                <div className="section-title">
                  <h3>Our Popular Products</h3>
                  <span style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{products.length} products found</span>
                </div>
                <div className="product-grid">
                  {products.map((p, i) => (
                    <motion.div 
                      key={i} 
                      className="product-card"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      onClick={() => handleAddToCart(p)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="img-circle">
                        {p.image_url ? (
                          <img 
                            src={p.image_url} 
                            alt={p.name} 
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Milk'; }}
                          />
                        ) : (
                          <span style={{ fontSize: '3rem' }}>🥛</span>
                        )}
                        <div className="price-tag">${p.price}</div>
                      </div>
                      <div className="product-info" style={{ textAlign: 'center' }}>
                        <div className="category" style={{ color: 'var(--primary-green)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                          {p.category_name}
                        </div>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                          {p.name}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600' }}>
                          Unit: {p.unit}
                        </p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="login-btn" onClick={() => handleAddToCart(p)} style={{ marginTop: '1rem' }}>
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentView === 'cart' && (
              <motion.div variants={itemVariants}>
                <div className="section-title">
                  <h3>My Cart</h3>
                  <span style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{cart.length} items</span>
                </div>
                <div className="data-container glass-card">
                  {cart.length === 0 ? <p>Your cart is empty.</p> : (
                    <>
                      <table>
                        <thead>
                          <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {cart.map((i, idx) => (
                            <tr key={idx}>
                              <td>{i.name}</td>
                              <td>
                                <input type="number" min="1" value={i.qty} onChange={(e) => handleQtyChange(i.id, parseInt(e.target.value || '1', 10))} style={{ width: '80px', padding: '0.5rem' }} />
                              </td>
                              <td>${Number(i.price).toFixed(2)}</td>
                              <td>${(Number(i.price) * i.qty).toFixed(2)}</td>
                              <td><span className="logout-link" onClick={() => handleRemoveFromCart(i.id)}>Remove</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <strong>Total: ${cart.reduce((t,i)=>t + Number(i.price) * i.qty, 0).toFixed(2)}</strong>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="login-btn" onClick={handleCheckout}>Checkout</motion.button>
                      </div>
                      {checkoutError && <p style={{ color: '#e74c3c', marginTop: '0.5rem' }}>{checkoutError}</p>}
                      {orderSummary && (
                        <div style={{ marginTop: '1rem' }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>Order #{orderSummary.order_id}</h4>
                          <div className="data-container" style={{ padding: '1rem' }}>
                            {orderSummary.items && orderSummary.items.length > 0 ? (
                              <table>
                                <thead>
                                  <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                                </thead>
                                <tbody>
                                  {orderSummary.items.map((it, idx) => (
                                    <tr key={idx}>
                                      <td>{it.product}</td>
                                      <td>{it.quantity}</td>
                                      <td>${Number(it.price).toFixed(2)}</td>
                                      <td>${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p>No item breakdown available.</p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                              <strong>Total: ${Number(orderSummary.total_amount).toFixed(2)}</strong>
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <motion.button className="login-btn" onClick={() => handlePayment('card')}>Pay by Card</motion.button>
                                <motion.button className="login-btn" onClick={() => handlePayment('cod')}>Cash on Delivery</motion.button>
                              </div>
                            </div>
                            {paymentStatus && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <p>{paymentStatus}</p>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="login-btn" onClick={() => window.print()} style={{ marginTop: '0.5rem' }}>
                                  Print Bill
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {currentView === 'admin' && user.role === 'admin' && (
              <motion.div variants={itemVariants}>
                <div className="section-title">
                  <h3>Separate Admin Dashboard</h3>
                </div>
                <div className="data-container glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <motion.div 
                    className="icon-circle" 
                    style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto 2rem' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    ⚙️
                  </motion.div>
                  {adminData ? (
                    <>
                      <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>{adminData.message}</h2>
                      <div className="stats-grid" style={{ marginTop: '2rem' }}>
                        <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                          <h3>Total Users</h3>
                          <div className="value">{adminData.stats.total_users}</div>
                        </motion.div>
                        <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                          <h3>System Status</h3>
                          <div className="value" style={{ fontSize: '1.5rem' }}>{adminData.stats.system_status}</div>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <p>Loading Admin Data...</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
