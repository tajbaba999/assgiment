import mongoose, { Schema, Document } from 'mongoose';

interface IPharmacy extends Document {
  name: string;
  address: {
    city: string;
    state: string;
    zip_code: string;
    location: string;
  };
  contactInformation: string;
  phone_number: string;
  email: string;
  license_number: string;
  owner_name: string;
}

const addressSchema: Schema = new Schema({
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  location: { type: String, required: true },
});

const pharmacySchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: addressSchema, required: true },
  contactInformation: { type: String, required: true },
  phone_number: { type: String, required: true }, 
  email: { type: String, required: true },
  license_number: { type: String, required: true },
  owner_name: { type: String, required: true },
});

pharmacySchema.statics.findByName = async function (name: string) {
  return this.findOne({ name });
};

const Pharmacy = mongoose.model<IPharmacy>('Pharmacy', pharmacySchema);

export default Pharmacy;
