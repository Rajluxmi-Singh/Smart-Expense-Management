import mongoose from "mongoose";

export const connectDB = async () => {
  const db = process.env.MONGO_URI;

  if (!db) {
    console.error("❌ MONGO_URI is not defined in your environment variables.");
    process.exit(1); // Stop the app
  }

  try {
    const { connection } = await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
