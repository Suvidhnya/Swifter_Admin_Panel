import mongoose, { Schema, Document } from 'mongoose';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export interface IProduct extends Document {
  name: string;
  description: string;
  version: string;
  status: ProductStatus;
  category: string;
  owner: string;
  features: string[];
  documentation: string;
  launchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE
    },
    category: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    features: [{
      type: String
    }],
    documentation: {
      type: String,
      default: ''
    },
    launchDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
