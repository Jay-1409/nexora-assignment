import React from 'react'

export default function Products({ products = [], onAdd, error }) {
  const isLoading = !error && products.length === 0;

  return (
    <section className="products">
      <div className="section-header">
        <h2>Available Products</h2>
        {!error && <span className="count">{products.length} items</span>}
      </div>
      
      <div className="grid">
        {error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card skeleton">
              <div className="shimmer" />
            </div>
          ))
        ) : (
          products.map(p => (
            <div key={p.id} className="card">
              <div className="card-content">
                <h3>{p.name}</h3>
                <p className="desc">{p.desc}</p>
                <div className="card-footer">
                  <p className="price">${p.price.toFixed(2)}</p>
                  <button 
                    onClick={() => onAdd(p.id)}
                    title={`Add ${p.name} to cart`}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
