import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password_hash: string;
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
}, { timestamps: true }); 

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export { User };