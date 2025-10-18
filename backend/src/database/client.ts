import { MongoClient, Db } from 'mongodb';

const uri =
  'mongodb+srv://medical-messenger-dev-user:MedicalMessenger@medicalmessengerdev.zgksfb6.mongodb.net/?retryWrites=true&w=majority&appName=MedicalMessengerDev';

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
