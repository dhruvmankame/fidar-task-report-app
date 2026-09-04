const mongoose = require('mongoose');

// A comment / daily work-update entry embedded inside a task.
const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: '' }, // denormalised so the app can render without an extra lookup
    text: { type: String, required: true, trim: true },
    // true = this is a "daily work update" (surfaced to the manager), false = a normal comment.
    isUpdate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A file attachment on a task. For this MVP we store the image inline as a
// base64 data URL, so we don't need a separate file server or storage bucket.
const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'attachment' },
    dataUrl: { type: String, required: true }, // e.g. "data:image/jpeg;base64,...."
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedByName: { type: String, default: '' },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    dueDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
