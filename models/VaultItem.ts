import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User'; 

export interface IVaultItem extends Document {
  userId: IUser['_id'];
  encryptedData: string;
}

const VaultItemSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  encryptedData: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const VaultItem = mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export { VaultItem };