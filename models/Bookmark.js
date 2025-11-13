import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  destinationId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Bookmark', bookmarkSchema);
