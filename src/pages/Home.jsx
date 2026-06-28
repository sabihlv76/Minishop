import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=90',
    title: 'Everyday shopping made lighter, clearer and faster',
    eyebrow: 'Mini supermarket',
    description:
      'Browse drinks, family staples, milk powder, baby care and cooking essentials from one clean storefront.',
    category: 'All',
    cta: 'Browse all items',
  },
  {
    image:
      'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1600&q=90',
    title: 'Cold drinks and celebration bottles ready for pick-up',
    eyebrow: 'Beverage shelf',
    description:
      'Beer, cider, wine and spirits are now grouped for faster browsing and easier ordering.',
    category: 'Wines & Spirits',
    cta: 'Shop drinks',
  },
  {
    image:
      'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=1600&q=90',
    title: 'Baby care and milk staples kept simple to find',
    eyebrow: 'Family stock',
    description:
      'Formula, milk powder and baby essentials now have a calmer, more trustworthy shopping flow.',
    category: 'Milk & Baby',
    cta: 'View baby shelf',
  },
  {
    image:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1600&q=90',
    title: 'Kitchen essentials with a cleaner white and sky-blue feel',
    eyebrow: 'Daily cooking',
    description:
      'Cooking oil and household staples sit inside a brighter, friendlier mini-market experience.',
    category: 'Cooking Essentials',
    cta: 'See essentials',
  },
];

const quickCategories = [
  'Beer & Cider',
  'Wines & Spirits',
  'Milk & Baby',
  'Cooking Essentials',
];

const totalHeroSlides = heroSlides.length;

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

const Home = ({
  adminSettings,
  products,
  wishlist,
  searchQuery,
  selectedCategory,
  onAddToCart,
  onCategoryChange,
  onSearchChange,
  onToggleWishlist,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const shopRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % totalHeroSlides);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.subcategory || '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const featuredProducts = filteredProducts.slice(0, 16);

  const goToShop = (category = selectedCategory) => {
    onCategoryChange(category);
    window.requestAnimationFrame(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="home-page">
      <section className="home-hero container">
        <div className="hero-slider-card">
          {heroSlides.map((slide, index) => (
            <article
              key={slide.title}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={slide.image} alt={slide.title} className="hero-slide-image" />
              <div className="hero-slide-overlay" />
              <div className="hero-slide-content">
                <span className="eyebrow">{slide.eyebrow}</span>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <button
                  type="button"
                  className="btn-accent"
                  onClick={() => goToShop(slide.category)}
                >
                  {slide.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}

          <div className="hero-slider-controls">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((current) => (current - 1 + totalHeroSlides) % totalHeroSlides)
              }
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <span>{currentSlide + 1} / {totalHeroSlides}</span>
            <button
              type="button"
              onClick={() => setCurrentSlide((current) => (current + 1) % totalHeroSlides)}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="hero-dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={index === currentSlide ? 'active' : ''}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <aside className="hero-side-panel">
          <div className="hero-panel-card">
            <span className="eyebrow">Quick browse</span>
            <h2>{adminSettings.storeName}</h2>
            <p className="panel-copy">
              Reach {adminSettings.ownerName} directly in {adminSettings.location} for fast WhatsApp orders and stock checks.
            </p>
            <div className="category-quick-grid">
              {quickCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="category-quick-card"
                  onClick={() => goToShop(category)}
                >
                  <strong>{category}</strong>
                  <span>Open collection</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="container promo-strip">
        <article className="promo-card">
          <img
            src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=1200&q=80"
            alt="Mini supermarket shelves"
          />
          <div className="promo-copy">
            <span className="eyebrow">Fresh business direction</span>
            <h3>From electronics to a warmer supermarket storefront built for daily shopping</h3>
          </div>
        </article>
        <article className="promo-card">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80"
            alt="Baby and household essentials"
          />
          <div className="promo-copy">
            <span className="eyebrow">Always reachable</span>
            <h3>Call or WhatsApp the shop quickly for prices, delivery details and stock confirmation</h3>
          </div>
        </article>
      </section>

      <section id="shop" ref={shopRef} className="container page-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop catalog</span>
            <h2>{selectedCategory === 'All' ? 'Featured supermarket items' : selectedCategory}</h2>
          </div>
          <div className="filter-chips">
            {['All', ...quickCategories].map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {searchQuery && (
          <p className="results-caption">
            {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} for{' '}
            <strong>{searchQuery}</strong>
          </p>
        )}

        {featuredProducts.length === 0 ? (
          <div className="empty-state-card">
            <h3>No products matched this search</h3>
            <p>Try another keyword or switch to a different category.</p>
            <button type="button" className="btn-outline" onClick={() => onSearchChange('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => {
              const inWishlist = wishlist.includes(product.id);
              return (
                <article key={product.id} className="product-card">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-card-media">
                    <Link to={`/product/${product.id}`} className="product-card-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(event) => applyProductImageFallback(event, product.category)}
                      />
                    </Link>
                    <button
                      type="button"
                      className={`product-image-wishlist ${inWishlist ? 'wishlisted' : ''}`}
                      onClick={() => onToggleWishlist(product.id)}
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="product-card-body">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="product-card-title">{product.name}</h3>
                    </Link>
                    <p className="product-card-size">{product.size}</p>
                    <p className="product-card-desc">{product.description}</p>
                    <div className="product-card-footer">
                      <div className="product-price">{formatRwf(product.price)}</div>
                      <div className="card-actions product-card-actions">
                        <Link
                          to={`/product/${product.id}`}
                          className="product-action-button product-view-button"
                          title="See product"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          className="product-action-button product-cart-button"
                          onClick={() => onAddToCart(product)}
                          title="Add to cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
