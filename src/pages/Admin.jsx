import { useMemo, useState } from 'react';
import {
  ImagePlus,
  KeyRound,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
} from 'lucide-react';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const initialForm = {
  name: '',
  category: 'Beer & Cider',
  price: '',
  size: '',
  badge: '',
  image: '',
  extraImages: [],
  description: '',
  benefits: '',
  ingredients: '',
  instructions: '',
};

const Admin = ({
  adminSettings,
  authStorageKey,
  onDeleteProduct,
  onRefreshProducts,
  onResetCatalog,
  onSaveAdminSettings,
  onSaveProduct,
  products,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.localStorage.getItem(authStorageKey) === 'true'
  );
  const [credentials, setCredentials] = useState({ phone: '', pin: '' });
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('success');
  const [settingsForm, setSettingsForm] = useState(adminSettings);
  const [formFeedback, setFormFeedback] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery]);

  const showStatus = (message, tone = 'success') => {
    setStatusTone(tone);
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2800);
  };

  const updateAuthField = (field) => (event) => {
    setCredentials((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateFormField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateSettingsField = (field) => (event) => {
    setSettingsForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (
      credentials.phone.trim() === adminSettings.phone &&
      credentials.pin.trim() === adminSettings.pin
    ) {
      setIsAuthenticated(true);
      setAuthError('');
      window.localStorage.setItem(authStorageKey, 'true');
      return;
    }

    setAuthError('Incorrect phone or PIN. Use the saved business phone and admin PIN.');
  };

  const handleLogout = () => {
    window.localStorage.removeItem(authStorageKey);
    setIsAuthenticated(false);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormFeedback('');
    setForm({
      name: product.name || '',
      category: product.category || 'Beer & Cider',
      price: String(product.price || ''),
      size: product.size || '',
      badge: product.badge || '',
      image: product.image || '',
      extraImages: product.extraImages || product.extra_images || [],
      description: product.description || '',
      benefits: (product.benefits || []).join('\n'),
      ingredients: product.ingredients || '',
      instructions: product.instructions || '',
    });
    setIsModalOpen(true);
  };

  const handlePrimaryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const image = await fileToDataUrl(file);
    setForm((current) => ({ ...current, image }));
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const extraImages = await Promise.all(files.map(fileToDataUrl));
    setForm((current) => ({ ...current, extraImages }));
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setFormFeedback('');
    try {
      await onSaveProduct(
        {
          badge: form.badge.trim(),
          benefits: form.benefits
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          category: form.category,
          description: form.description.trim(),
          extraImages: form.extraImages,
          image: form.image,
          ingredients: form.ingredients.trim(),
          instructions: form.instructions.trim(),
          name: form.name.trim(),
          price: Number(form.price),
          size: form.size.trim(),
        },
        editingId
      );

      setIsModalOpen(false);
      setForm(initialForm);
      setFormFeedback('');
      showStatus(editingId ? 'Product updated successfully.' : 'Product added successfully.');
    } catch (error) {
      setFormFeedback(error.message || 'Could not save product.');
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    try {
      await onSaveAdminSettings(settingsForm);
      showStatus('Business settings saved successfully.');
    } catch (error) {
      showStatus(error.message || 'Could not save business settings.', 'error');
    }
  };

  const totalValue = filteredProducts.reduce((sum, product) => sum + Number(product.price || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <span className="eyebrow">Protected access</span>
          <h1>Admin panel sign in</h1>
          <p>
            This secure page protects store management, owner details and mobile image uploads.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-phone">Business phone</label>
              <input
                id="admin-phone"
                type="tel"
                value={credentials.phone}
                onChange={updateAuthField('phone')}
                placeholder={adminSettings.phone}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-pin">PIN or password</label>
              <input
                id="admin-pin"
                type="password"
                value={credentials.pin}
                onChange={updateAuthField('pin')}
                placeholder="Enter your admin PIN"
                required
              />
            </div>

            {authError && <p className="form-error">{authError}</p>}

            <button type="submit" className="btn-primary full-width">
              Access admin panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Store management</span>
          <h1>{adminSettings.storeName} dashboard</h1>
          <p>
            Manage the supermarket catalog, owner contact details and shelf images from one place.
          </p>
        </div>
        <div className="inline-actions">
          <button type="button" className="btn-accent" onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setFormFeedback('');
            setIsModalOpen(true);
          }}>
            <Plus size={18} />
            Add product
          </button>
          <button type="button" className="btn-outline" onClick={handleLogout}>
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </section>

      {statusMessage && <div className={`status-banner ${statusTone}`}>{statusMessage}</div>}

      <section className="admin-metrics">
        <article className="metric-card">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </article>
        <article className="metric-card">
          <span>Filtered results</span>
          <strong>{filteredProducts.length}</strong>
        </article>
        <article className="metric-card">
          <span>Catalog value</span>
          <strong>{totalValue.toLocaleString()} RWF</strong>
        </article>
      </section>

      <section className="admin-layout">
        <div className="admin-main-card">
          <div className="admin-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search products by name, category or description"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="inline-actions">
              <button type="button" className="btn-outline" onClick={onRefreshProducts}>
                Refresh
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={async () => {
                  try {
                    await onResetCatalog();
                    showStatus('Default catalog restored.');
                  } catch (error) {
                    showStatus(error.message || 'Could not reset catalog.', 'error');
                  }
                }}
              >
                Reset catalog
              </button>
            </div>
          </div>

          <div className="admin-product-list">
            {filteredProducts.map((product) => (
              <article key={product.id} className="admin-product-card">
                <img src={product.image} alt={product.name} />
                <div className="admin-product-copy">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.category}</p>
                  </div>
                  <strong>{Number(product.price).toLocaleString()} RWF</strong>
                </div>
                <div className="admin-product-actions">
                  <button type="button" className="btn-icon btn-icon-outline" onClick={() => openEditModal(product)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-icon-primary danger"
                    onClick={async () => {
                      try {
                        await onDeleteProduct(product.id);
                        showStatus('Product deleted successfully.');
                      } catch (error) {
                        showStatus(error.message || 'Could not delete product.', 'error');
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="settings-card">
          <div className="settings-card-head">
            <h2>Business settings</h2>
          </div>
          <form className="stack-list" onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label htmlFor="settings-store-name">Business name</label>
              <div className="field-with-icon">
                <Store size={16} />
                <input
                  id="settings-store-name"
                  type="text"
                  value={settingsForm.storeName}
                  onChange={updateSettingsField('storeName')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-owner">Owner name</label>
              <div className="field-with-icon">
                <UserRound size={16} />
                <input
                  id="settings-owner"
                  type="text"
                  value={settingsForm.ownerName}
                  onChange={updateSettingsField('ownerName')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-phone">Business phone</label>
              <div className="field-with-icon">
                <Phone size={16} />
                <input
                  id="settings-phone"
                  type="tel"
                  value={settingsForm.phone}
                  onChange={updateSettingsField('phone')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-location">Location</label>
              <div className="field-with-icon">
                <MapPin size={16} />
                <input
                  id="settings-location"
                  type="text"
                  value={settingsForm.location}
                  onChange={updateSettingsField('location')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-pin">Admin PIN</label>
              <div className="field-with-icon">
                <KeyRound size={16} />
                <input
                  id="settings-pin"
                  type="password"
                  value={settingsForm.pin}
                  onChange={updateSettingsField('pin')}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-accent">
              <ShieldCheck size={18} />
              Save business settings
            </button>
          </form>
        </aside>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => { setIsModalOpen(false); setFormFeedback(''); }}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingId ? 'Edit product' : 'Add new product'}</h2>
              <button type="button" className="btn-outline" onClick={() => { setIsModalOpen(false); setFormFeedback(''); }}>
                Close
              </button>
            </div>

            <form className="settings-card stack-list" onSubmit={handleSaveProduct}>
              {formFeedback && <div className="form-feedback error">{formFeedback}</div>}
              <div className="form-grid">
                <div className="form-group span-2">
                  <label htmlFor="product-name">Product name</label>
                  <input
                    id="product-name"
                    type="text"
                    value={form.name}
                    onChange={updateFormField('name')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product-category">Category</label>
                  <select
                    id="product-category"
                    value={form.category}
                    onChange={updateFormField('category')}
                  >
                    <option value="Beer & Cider">Beer & Cider</option>
                    <option value="Wines & Spirits">Wines & Spirits</option>
                    <option value="Milk & Baby">Milk & Baby</option>
                    <option value="Cooking Essentials">Cooking Essentials</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="product-price">Price</label>
                  <input
                    id="product-price"
                    type="number"
                    value={form.price}
                    onChange={updateFormField('price')}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-size">Variant / size</label>
                  <input
                    id="product-size"
                    type="text"
                    value={form.size}
                    onChange={updateFormField('size')}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-badge">Badge</label>
                  <input
                    id="product-badge"
                    type="text"
                    value={form.badge}
                    onChange={updateFormField('badge')}
                    placeholder="Best Seller, New Arrival, Hot Deal"
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-image">Primary image from phone</label>
                  <label className="upload-field" htmlFor="product-image">
                    <ImagePlus size={18} />
                    <span>Choose image</span>
                  </label>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageUpload}
                    className="hidden-input"
                  />
                  {form.image && <img src={form.image} alt="Primary preview" className="upload-preview" />}
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-gallery">Extra gallery images</label>
                  <label className="upload-field" htmlFor="product-gallery">
                    <ImagePlus size={18} />
                    <span>Select multiple images</span>
                  </label>
                  <input
                    id="product-gallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleExtraImagesUpload}
                    className="hidden-input"
                  />
                  {form.extraImages.length > 0 && (
                    <div className="upload-preview-grid">
                      {form.extraImages.map((image) => (
                        <img key={image} src={image} alt="Extra preview" className="upload-preview" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-description">Description</label>
                  <textarea
                    id="product-description"
                    rows="4"
                    value={form.description}
                    onChange={updateFormField('description')}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-benefits">Key features</label>
                  <textarea
                    id="product-benefits"
                    rows="4"
                    value={form.benefits}
                    onChange={updateFormField('benefits')}
                    placeholder="One feature per line"
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-ingredients">Materials / build</label>
                  <input
                    id="product-ingredients"
                    type="text"
                    value={form.ingredients}
                    onChange={updateFormField('ingredients')}
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="product-notes">Availability / notes</label>
                  <textarea
                    id="product-notes"
                    rows="3"
                    value={form.instructions}
                    onChange={updateFormField('instructions')}
                  />
                </div>
              </div>

              <div className="inline-actions end">
                <button type="submit" className="btn-accent">
                  Save product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
