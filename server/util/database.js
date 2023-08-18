const mongoose = require('mongoose');

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL);
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = db;
