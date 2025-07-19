import { Schema, model, Document } from 'mongoose';

export interface ITodoDocument extends Document {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: string;
  dueDate?: Date;
}

const TodoSchema = new Schema<ITodoDocument>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: false, // We handle createdAt manually
    collection: 'todos',
  }
);

// Create indexes for better query performance
TodoSchema.index({ completed: 1 });
TodoSchema.index({ createdAt: -1 });
TodoSchema.index({ priority: 1 });
TodoSchema.index({ dueDate: 1 });

export const TodoModel = model<ITodoDocument>('Todo', TodoSchema);
