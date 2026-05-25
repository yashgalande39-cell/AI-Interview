const mongoose = require('mongoose');
const mockDb = require('../models/mockDb');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("-----------------------------------------------------------------");
    console.log("⚠️  No MONGODB_URI found. Switching to Local JSON Mock Database.");
    console.log("📂 File Location: backend/data/mock_db.json");
    console.log("-----------------------------------------------------------------");
    return { isMock: true, db: mockDb };
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("🔌 Connected to live MongoDB Atlas database successfully.");
    return { isMock: false, mongoose };
  } catch (err) {
    console.error("❌ MongoDB Connection failed:", err.message);
    console.log("🔄 Gracefully falling back to Local JSON Mock Database.");
    return { isMock: true, db: mockDb };
  }
};

module.exports = connectDB;
