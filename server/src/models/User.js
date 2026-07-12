import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    company: this.company,
    role: this.role,
  };
};

export const User = mongoose.model('User', userSchema);
