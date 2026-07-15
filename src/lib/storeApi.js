const STORE_ENDPOINT = '/api/store';

export async function fetchStoreData() {
  let response;

  try {
    response = await fetch(STORE_ENDPOINT, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the API is running.');
  }

  if (!response.ok) {
    throw new Error(`Failed to load store data (${response.status})`);
  }

  return response.json();
}

export async function saveStoreData(payload) {
  let response;

  try {
    response = await fetch(STORE_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the API is running.');
  }

  if (!response.ok) {
    throw new Error(`Failed to save store data (${response.status})`);
  }

  return response.json();
}
