import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  mongoose.set("strictQuery", true);
  
  // Add virtual 'id' field to all JSON output (maps _id to id)
  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    }
  });
  
  // Configure connection options for stability
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected, attempting to reconnect...');
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected!');
  });

  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true
  });
};
