import mongoose from 'mongoose';
import { env } from '../env';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
