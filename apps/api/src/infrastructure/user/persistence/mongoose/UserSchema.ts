import { Schema, model, Document } from 'mongoose';

/**
 * Mongoose User Schema
 * For MongoDB user collection
 */
export interface IUserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  _id: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 254,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 50,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'users',
  timestamps: false, // We handle createdAt manually
});

// Create indexes for better query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const UserModel = model<IUserDocument>('User', UserSchema);