import mongoose, { Document } from 'mongoose';

export interface IContent extends Document {
  user: mongoose.Types.ObjectId;
  url: string;
  title: string;
  type: 'article' | 'video';
  source: string;
  summary: string;
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['article', 'video'],
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create a compound index on user and url to prevent duplicates
contentSchema.index({ user: 1, url: 1 }, { unique: true });

export default mongoose.model<IContent>('Content', contentSchema);