import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Heart,
  Home as HomeIcon,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import CartDrawer from './components/CartDrawer';
import WhatsAppWidget from './components/WhatsAppWidget';
import { products as defaultProducts } from './productsData';
import {
  ADMIN_AUTH_KEY,
  ADMIN_SETTINGS_KEY,
  CART_KEY,
  PRODUCTS_KEY,
  USER_KEY,
  WISHLIST_KEY,
  defaultAdminSettings,
  readStorage,
  writeStorage,
} from './lib/localStore';
import { fetchStoreData, saveStoreData } from './lib/storeApi';
import './index.css';

const navCategories = [
  'Beer & Cider',
  'Wines & Spirits',
  'Milk & Baby',
  'Cooking Essentials',
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProductId(name) {
  return `${slugify(name)}-${Date.now()}`;
}

function HeaderAction({ label, count, to, onClick, icon: Icon }) {
  const content = (
    <>
      <span className="header-action-icon-wrap">
        <Icon size={18} />
        {typeof count === 'number' && count > 0 && (
          <span className="header-count-badge">{count}</span>
        )}
      </span>
      <span className="header-action-label">{label}</span>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `header-action-button${isActive ? ' active' : ''}`
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button type="button" className="header-action-button" onClick={onClick}>
      {content}
    </button>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/signin', '/signup'].includes(location.pathname);
  const isAdminPage = location.pathname === '/e1t-secure-panel';
  const showStoreChrome = !isAuthPage && !isAdminPage;

  const [products, setProducts] = useState(() =>
    readStorage(PRODUCTS_KEY, defaultProducts)
  );
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_KEY, []));
  const [user, setUser] = useState(() => readStorage(USER_KEY, null));
  const [adminSettings, setAdminSettings] = useState(() =>
    readStorage(ADMIN_SETTINGS_KEY, defaultAdminSettings)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [remoteStoreReady, setRemoteStoreReady] = useState(false);
  const [remoteStoreEnabled, setRemoteStoreEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRemoteStore() {
      try {
        const data = await fetchStoreData();
        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }

        if (data.adminSettings) {
          setAdminSettings((current) => ({
            ...current,
            ...data.adminSettings,
          }));
        }

        setRemoteStoreEnabled(true);
      } catch (error) {
        console.warn('Using local store data because the Mongo API is unavailable.', error);
      } finally {
        if (isMounted) {
          setRemoteStoreReady(true);
        }
      }
    }

    loadRemoteStore();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    writeStorage(PRODUCTS_KEY, products);
  }, [products]);

  useEffect(() => {
    writeStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist]);

  useEffect(() => {
    writeStorage(USER_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStorage(ADMIN_SETTINGS_KEY, adminSettings);
  }, [adminSettings]);

  useEffect(() => {
    if (!remoteStoreReady || !remoteStoreEnabled) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      saveStoreData({ products, adminSettings }).catch((error) => {
        console.warn('Could not sync data to Mongo Atlas.', error);
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [adminSettings, products, remoteStoreEnabled, remoteStoreReady]);

  useEffect(() => {
    let previousY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const hasScrolled = currentY > 20;
      const isMoving = Math.abs(currentY - previousY) > 6;

      if (!hasScrolled) {
        setShowMobileNav(false);
      } else if (isMoving) {
        setShowMobileNav(true);
      }

      previousY = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const featuredWishlistItems = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist]
  );

  const goHomeAndFilter = (category = 'All') => {
    setSelectedCategory(category);
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    window.requestAnimationFrame(() => {
      const target = document.getElementById('shop');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) => item.id === product.id && item.size === product.size
      );

      if (existingIndex >= 0) {
        return currentCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          image: product.image,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: product.size,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, size, quantity) => {
    if (quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter((item) => !(item.id === id && item.size === size))
      );
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (id, size) => {
    setCart((currentCart) =>
      currentCart.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(productId)
        ? currentWishlist.filter((id) => id !== productId)
        : [...currentWishlist, productId]
    );
  };

  const handleSignIn = (payload) => {
    setUser({
      email: payload.email,
      firstName: payload.firstName || 'Customer',
      lastName: payload.lastName || 'Guest',
      phone: payload.phone || '',
    });
  };

  const handleSignUp = (payload) => {
    setUser(payload);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const handleAccountSave = (payload) => {
    setUser((currentUser) => ({
      ...(currentUser || {}),
      ...payload,
    }));
  };

  const handleAdminSettingsSave = (nextSettings) => {
    setAdminSettings(nextSettings);
  };

  const handleSaveProduct = (productPayload, editingId) => {
    setProducts((currentProducts) => {
      if (editingId) {
        return currentProducts.map((product) =>
          product.id === editingId ? { ...product, ...productPayload } : product
        );
      }

      return [
        {
          id: buildProductId(productPayload.name),
          ...productPayload,
        },
        ...currentProducts,
      ];
    });
  };

  const handleDeleteProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );
    setWishlist((currentWishlist) =>
      currentWishlist.filter((id) => id !== productId)
    );
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const handleResetCatalog = () => {
    setProducts(defaultProducts);
  };

  const handleRefreshProducts = async () => {
    if (!remoteStoreEnabled) {
      setProducts(readStorage(PRODUCTS_KEY, defaultProducts));
      return;
    }

    try {
      const data = await fetchStoreData();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      }
      if (data.adminSettings) {
        setAdminSettings((current) => ({
          ...current,
          ...data.adminSettings,
        }));
      }
    } catch (error) {
      console.warn('Could not refresh from Mongo Atlas.', error);
    }
  };

  return (
    <>
      {showStoreChrome && (
        <header className="site-header">
          <div className="container site-header-shell">
            <div className="site-header-top">
              <Link to="/" className="brand-lockup" onClick={() => goHomeAndFilter('All')}>
                <span className="brand-mark brand-mark-text">CM</span>
                <span className="brand-copy">
                  <strong>{adminSettings.storeName}</strong>
                  <span>{adminSettings.ownerName} • Mini supermarket in {adminSettings.location}</span>
                </span>
              </Link>

              <div className="site-header-actions">
                <HeaderAction
                  label="Wishlist"
                  count={wishlist.length}
                  to="/wishlist"
                  icon={Heart}
                />
                <HeaderAction
                  label="Cart"
                  count={cartCount}
                  onClick={() => setIsCartOpen(true)}
                  icon={ShoppingBag}
                />
              </div>
            </div>

            <div className="site-search-row">
              <div className="header-search">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                    }
                  }}
                  aria-label="Search products"
                  placeholder="Search beverages, baby care, cooking oil and more"
                />
                <Search size={18} aria-hidden="true" />
              </div>
            </div>

            <div className="site-nav-row">
              <nav className="site-nav-links">
                <button type="button" onClick={() => goHomeAndFilter('All')}>
                  Home
                </button>
                <button type="button" onClick={() => goHomeAndFilter('All')}>
                  Shop
                </button>
                {navCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => goHomeAndFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>
      )}

      {showStoreChrome && (
        <a className="call-fab" href={`tel:${adminSettings.phone}`} aria-label="Call shop">
          <Phone size={20} />
        </a>
      )}

      {showStoreChrome && (
        <nav className={`mobile-bottom-nav${showMobileNav ? ' visible' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Home"
          >
            <HomeIcon size={20} />
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="bottom-nav-count">{wishlist.length}</span>
            )}
          </NavLink>
          <button
            type="button"
            className="bottom-nav-item"
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="bottom-nav-count">{cartCount}</span>}
          </button>
          <NavLink
            to={user ? '/account' : '/signin'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Account"
          >
            <User size={20} />
          </NavLink>
        </nav>
      )}

      <main className="site-main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                products={products}
                wishlist={wishlist}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                onCategoryChange={setSelectedCategory}
                onSearchChange={setSearchQuery}
                adminSettings={adminSettings}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                key={location.pathname}
                products={products}
                onAddToCart={handleAddToCart}
                phone={adminSettings.phone}
                storeName={adminSettings.storeName}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                products={featuredWishlistItems}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
              />
            }
          />
          <Route
            path="/account"
            element={
              <AccountPage
                key={user?.email || 'guest-account'}
                user={user}
                onSave={handleAccountSave}
                onSignOut={handleSignOut}
              />
            }
          />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route
            path="/e1t-secure-panel"
            element={
              <Admin
                key={`${adminSettings.storeName}-${adminSettings.phone}`}
                adminSettings={adminSettings}
                authStorageKey={ADMIN_AUTH_KEY}
                onDeleteProduct={handleDeleteProduct}
                onRefreshProducts={handleRefreshProducts}
                onResetCatalog={handleResetCatalog}
                onSaveAdminSettings={handleAdminSettingsSave}
                onSaveProduct={handleSaveProduct}
                products={products}
              />
            }
          />
        </Routes>
      </main>

      {showStoreChrome && (
        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <span className="brand-mark brand-mark-text footer-brand-mark">CM</span>
              <p>
                Your neighborhood mini supermarket for drinks, baby care, and
                everyday kitchen essentials.
              </p>
            </div>

            <div>
              <h4>Shop</h4>
              <button type="button" onClick={() => goHomeAndFilter('Beer & Cider')}>
                Beer & Cider
              </button>
              <button type="button" onClick={() => goHomeAndFilter('Wines & Spirits')}>
                Wines & Spirits
              </button>
              <button type="button" onClick={() => goHomeAndFilter('Milk & Baby')}>
                Milk & Baby
              </button>
            </div>

            <div>
              <h4>Account</h4>
              <Link to={user ? '/account' : '/signin'}>My account</Link>
              <Link to="/wishlist">Wishlist</Link>
              <button type="button" onClick={() => setIsCartOpen(true)}>
                Cart
              </button>
            </div>

            <div>
              <h4>Contact</h4>
              <a href={`tel:${adminSettings.phone}`}>{adminSettings.phone}</a>
              <span>{adminSettings.ownerName}</span>
              <span className="footer-location">
                <MapPin size={15} />
                {adminSettings.location}
              </span>
            </div>
          </div>
        </footer>
      )}

      {showStoreChrome && (
        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveItem}
          onUpdateQty={handleUpdateQty}
          phone={adminSettings.phone}
        />
      )}

      {showStoreChrome && (
        <WhatsAppWidget
          phone={adminSettings.phone}
          products={products}
          storeName={adminSettings.storeName}
          location={adminSettings.location}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
