const STORE_ENDPOINT = '/api/store';

export async function fetchStoreData() {
  const response = await fetch(STORE_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load store data (${response.status})`);
  }

  return response.json();
}

export async function saveStoreData(payload) {
  const response = await fetch(STORE_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to save store data (${response.status})`);
  }

  return response.json();
}
