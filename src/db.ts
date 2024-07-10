import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/pharma`);

    console.log('MongoDB Connected');
  } catch (error : any) {
    console.error(`Error: ${error.message}`);
  }
};

export default connectDb;
