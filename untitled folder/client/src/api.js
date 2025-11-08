async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts)
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      console.error(`API Error (${res.status}):`, json)
      return { 
        error: json || { 
          status: res.status, 
          statusText: res.statusText,
          message: `Server error: ${res.status} ${res.statusText}`
        } 
      }
    }
    return json
  } catch (err) {
    console.error('Network Error:', err)
    return { 
      error: { 
        message: err.message || 'Failed to connect to server. Please try again.' 
      } 
    }
  }
}

export async function fetchProducts() {
  const r = await safeFetch('/api/products')
  if (r && r.error) {
    throw new Error(
      r.error.message || 
      'Failed to load products. Please check your connection and try again.'
    )
  }
  return r
}

export async function fetchCart() {
  const r = await safeFetch('/api/cart')
  if (r && r.error) return { items: [], total: 0 }
  return r
}

export async function addToCart(productId, qty = 1) {
  return safeFetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, qty }) })
}

export async function removeCartItem(cartId) {
  return safeFetch(`/api/cart/${cartId}`, { method: 'DELETE' })
}

export async function updateCartQty(cartId, qty) {
  return safeFetch(`/api/cart/${cartId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ qty }) })
}

export async function checkout(payload) {
  return safeFetch('/api/checkout', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
}
