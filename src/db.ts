import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pharma');

    console.log('MongoDB Connected');
  } catch (error : any) {
    console.error(`Error: ${error.message}`);
  }
};

export default connectDb;
