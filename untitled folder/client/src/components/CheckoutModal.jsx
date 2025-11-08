import React, { useState } from 'react'

export default function CheckoutModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      console.error('Checkout failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Complete Your Order</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter your full name"
              required
              autoFocus
              minLength={2}
              pattern="[A-Za-z .]+"
              title="Please enter a valid name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder="you@example.com"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address"
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
