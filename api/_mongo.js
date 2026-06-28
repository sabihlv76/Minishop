/* global process */

import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient;

export async function getMongoDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'chez_mama_munyana';

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await cachedClient.connect();
  }

  return cachedClient.db(dbName);
}
