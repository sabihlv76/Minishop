import { getMongoDatabase } from './_mongo.js';
import { defaultAdminSettings } from '../src/lib/localStore.js';
import { products as defaultProducts } from '../src/productsData.js';

const collectionName = 'storefront';
const documentId = 'main-store';

let memoryStore = null;

function createDefaultDocument() {
  return {
    _id: documentId,
    adminSettings: defaultAdminSettings,
    products: defaultProducts,
    updatedAt: new Date().toISOString(),
  };
}

async function getStoreCollection() {
  const database = await getMongoDatabase();
  return database.collection(collectionName);
}

export default async function handler(request, response) {
  try {
    let collection;

    try {
      collection = await getStoreCollection();
    } catch {
      if (!memoryStore) {
        memoryStore = createDefaultDocument();
      }
      collection = null;
    }

    if (request.method === 'GET') {
      if (collection) {
        let document = await collection.findOne({ _id: documentId });

        if (!document) {
          document = createDefaultDocument();
          await collection.insertOne(document);
        }

        response.status(200).json({
          adminSettings: document.adminSettings,
          products: document.products,
          updatedAt: document.updatedAt,
        });
      } else {
        response.status(200).json({
          adminSettings: memoryStore.adminSettings,
          products: memoryStore.products,
          updatedAt: memoryStore.updatedAt,
        });
      }
      return;
    }

    if (request.method === 'PUT') {
      const nextAdminSettings = request.body?.adminSettings || defaultAdminSettings;
      const nextProducts = Array.isArray(request.body?.products)
        ? request.body.products
        : defaultProducts;

      const nextDocument = {
        _id: documentId,
        adminSettings: nextAdminSettings,
        products: nextProducts,
        updatedAt: new Date().toISOString(),
      };

      if (collection) {
        await collection.updateOne(
          { _id: documentId },
          { $set: nextDocument },
          { upsert: true }
        );
      }

      memoryStore = nextDocument;

      response.status(200).json({
        adminSettings: nextDocument.adminSettings,
        products: nextDocument.products,
        updatedAt: nextDocument.updatedAt,
      });
      return;
    }

    response.setHeader('Allow', 'GET, PUT');
    response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    response.status(500).json({
      error: 'Unable to process store request.',
      details: error.message,
    });
  }
}
