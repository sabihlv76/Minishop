export const categoryFallbackImages = {
  'Beer & Cider':
    'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=90',
  'Wines & Spirits':
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=90',
  'Milk & Baby':
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=900&q=90',
  'Cooking Essentials':
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=90',
};

export function applyProductImageFallback(event, category = 'Cooking Essentials') {
  const fallback =
    categoryFallbackImages[category] || categoryFallbackImages['Cooking Essentials'];
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallback;
}
