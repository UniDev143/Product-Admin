import React from 'react'

const ListedProductsPage = ({ products, onDeleteProduct, isLoading, errorMessage, onRefresh }) => {
  return (
    <section className="panel">
      <h2 className="panel-title">Listed Products</h2>

      <div className="list-actions">
        <button type="button" className="btn btn-primary" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {isLoading && <p className="empty-note">Loading products...</p>}
      {!isLoading && errorMessage && <p className="error-note">{errorMessage}</p>}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <p className="empty-note">No products listed yet.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <article key={product._id || product.id} className="product-card">
              <img src={product.mainImage} alt={product.name} className="product-image" />
              <div className="product-content">
                <h3>{product.name}</h3>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Company:</strong> {product.companyName}</p>
                <p><strong>Manufactured In:</strong> {product.manufacturedIn}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Other Images:</strong> {(product.otherImages || []).length}</p>
              </div>
              <button type="button" className="btn btn-danger" onClick={() => onDeleteProduct(product._id || product.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ListedProductsPage