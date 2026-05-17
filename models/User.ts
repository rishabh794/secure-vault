import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret: string;
  masterPasswordHash?: string;
  vaultKeyEncrypted?: string;
  vaultKeyVersion?: number;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
  },
  password_hash: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },
  masterPasswordHash: {
    type: String,
  },
  vaultKeyEncrypted: {
    type: String,
  },
  vaultKeyVersion: {
    type: Number,
    default: 1,
  },
}, { timestamps: true }); 

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export { User };