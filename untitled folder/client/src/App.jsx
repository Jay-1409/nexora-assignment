import React, { useEffect, useState } from 'react'
import Products from './components/Products'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import { fetchProducts, fetchCart, addToCart, removeCartItem, updateCartQty, checkout } from './api'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [checkoutReceipt, setCheckoutReceipt] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => { loadProducts(); loadCart(); }, [])

  const [error, setError] = useState(null)

  async function loadProducts() {
    try {
      const p = await fetchProducts()
      setProducts(p)
      setError(null) // Clear any previous errors on success
    } catch (err) {
      console.error('Failed to load products:', err)
      setError(err.message || 'Failed to load products. Please refresh to try again.')
      setProducts([]) // Reset products on error
    }
  }
  async function loadCart() {
    try {
      const c = await fetchCart()
      setCart(c)
      setError(null)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setError(err.message || 'Failed to load cart. Your cart might be temporarily unavailable.')
      setCart({ items: [], total: 0 })
    }
  }

  async function handleAdd(productId) {
    try {
      const r = await addToCart(productId, 1)
      if (r && r.error) throw new Error(r.error.message || 'Add failed')
      await loadCart()
    } catch (err) { setError(err.message) }
  }

  async function handleRemove(cartId) {
    try {
      await removeCartItem(cartId)
      await loadCart()
    } catch (err) { setError(err.message) }
  }

  async function handleUpdate(cartId, qty) {
    try {
      await updateCartQty(cartId, qty)
      await loadCart()
    } catch (err) { setError(err.message) }
  }

  async function handleCheckout(details) {
    try {
      const resp = await checkout({ cartItems: cart.items.map(i => ({ productId: i.productId, qty: i.qty })), ...details })
      if (resp && resp.error) throw new Error(resp.error.message || 'Checkout failed')
      setCheckoutReceipt(resp.receipt)
      setShowCheckout(false)
      await loadCart()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="app">
      <header>
        <h1>Vibe Commerce</h1>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="close-error">
            Dismiss
          </button>
        </div>
      )}

      <main>
        <Products products={products} onAdd={handleAdd} />
        <Cart 
          items={cart.items} 
          total={cart.total} 
          onRemove={handleRemove} 
          onUpdate={handleUpdate} 
          onCheckout={() => setShowCheckout(true)} 
        />
      </main>

      {showCheckout && (
        <CheckoutModal 
          onClose={() => setShowCheckout(false)} 
          onSubmit={handleCheckout}
        />
      )}

      {checkoutReceipt && (
        <div className="receipt">
          <div className="receipt-header">
            <h3>Order Confirmed!</h3>
            <button 
              onClick={() => setCheckoutReceipt(null)}
              className="close-receipt"
              aria-label="Close receipt"
            >
              ×
            </button>
          </div>
          <div className="receipt-body">
            <div className="receipt-row">
              <span>Order ID</span>
              <span>{checkoutReceipt.id}</span>
            </div>
            <div className="receipt-row">
              <span>Total</span>
              <span className="receipt-total">
                ${checkoutReceipt.total}
              </span>
            </div>
            <div className="receipt-row">
              <span>Date</span>
              <span>
                {new Date(checkoutReceipt.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
