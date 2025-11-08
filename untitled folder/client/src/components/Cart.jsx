import React from 'react'

export default function Cart({ items = [], total = 0, onRemove, onUpdate, onCheckout }) {
  function handleQtyChange(cartId, qty, currentQty) {
    if (qty >= 1) onUpdate(cartId, qty);
    else if (qty === 0) onRemove(cartId);
  }

  return (
    <aside className="cart">
      <h2>Shopping Cart</h2>
      
      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <small>Add items from the store to get started</small>
        </div>
      ) : (
        <div>
          <ul className="cart-items">
            {items.map(i => (
              <li key={i.cartId} className="cart-item">
                <div className="ci-left">
                  <strong>{i.name}</strong>
                  <div className="item-price">${i.price.toFixed(2)} each</div>
                  <div className="item-subtotal">
                    Subtotal: ${(i.price * i.qty).toFixed(2)}
                  </div>
                </div>
                <div className="ci-right">
                  <div className="qty-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => handleQtyChange(i.cartId, i.qty - 1, i.qty)}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      min="0" 
                      value={i.qty} 
                      onChange={(e) => handleQtyChange(i.cartId, Number(e.target.value), i.qty)}
                      title={`${i.name} quantity`}
                    />
                    <button 
                      className="qty-btn"
                      onClick={() => handleQtyChange(i.cartId, i.qty + 1, i.qty)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="remove" 
                    onClick={() => onRemove(i.cartId)}
                    title={`Remove ${i.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="total-label">Total</div>
              <div className="total-amount">${Number(total).toFixed(2)}</div>
            </div>
            <button 
              className="checkout" 
              onClick={onCheckout}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
