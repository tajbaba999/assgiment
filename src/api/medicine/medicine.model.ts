import mongoose, { Schema, Document } from 'mongoose';

interface IMedicine extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  pharmacy: mongoose.Types.ObjectId,
  image:  String,
}

const medicineSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, required: true },
  pharmacy: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  image : { type: String },
});

const Medicine = mongoose.model<IMedicine>('Medicine', medicineSchema);

export default Medicine;
