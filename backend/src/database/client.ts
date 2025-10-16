import { MongoClient, Db } from 'mongodb';
import { env } from '../env';

const uri = env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'MONGODB_URI was not found in the environment variables. Check your .env file.'
  );
}

let client: MongoClient;
let dbInstance: Db;

export async function getDb(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }

  client = new MongoClient(uri);
  await client.connect();
  dbInstance = client.db('medical-messenger-db');
  return dbInstance;
}
