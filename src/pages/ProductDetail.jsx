import { useState } from 'react';
import { ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

function normalizeWhatsAppPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (digits.startsWith('250')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `250${digits.slice(1)}`;
  }

  return digits;
}

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

const ProductDetail = ({ products, onAddToCart, phone, storeName }) => {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState('');

  if (!product) {
    return (
      <div className="page-shell container">
        <div className="empty-state-card">
          <h2>Product not found</h2>
          <p>The product you are looking for is not available.</p>
          <Link to="/" className="btn-primary">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  const displayImage = activeImage || product.image;
  const images = [product.image, ...(product.extraImages || [])].filter(Boolean);

  const handleWhatsApp = () => {
    const message = `Hello ${storeName}, I would like to order ${product.name} for ${formatRwf(
      product.price
    )}.`;
    window.open(`https://wa.me/${normalizeWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="page-shell container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to store
      </Link>

      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img
              src={displayImage}
              alt={product.name}
              onError={(event) => applyProductImageFallback(event, product.category)}
            />
          </div>

          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`detail-thumb ${(activeImage || product.image) === image ? 'active' : ''}`}
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={image}
                    alt={product.name}
                    onError={(event) => applyProductImageFallback(event, product.category)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatRwf(product.price)}</div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-meta-list">
            <div>
              <strong>Pack size</strong>
              <span>{product.size}</span>
            </div>
            {product.ingredients && (
              <div>
                <strong>Category notes</strong>
                <span>{product.ingredients}</span>
              </div>
            )}
          </div>

          {product.benefits?.length > 0 && (
            <ul className="feature-list">
              {product.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          )}

          <div className="detail-actions">
            <button type="button" className="btn-primary" onClick={() => onAddToCart(product)}>
              <ShoppingBag size={18} />
              Add to cart
            </button>
            <button type="button" className="btn-accent" onClick={handleWhatsApp}>
              <MessageSquare size={18} />
              WhatsApp order
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
