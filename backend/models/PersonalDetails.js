const mongoose = require('mongoose');

const personalDetailsSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name:     { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  email:         { type: String, required: true },
  phone_number:  { type: String, required: true },
  address:       { type: String, required: true },
  attachment: {
    file_name:     String,
    original_name: String,
    mime_type:     String,
    size:          Number,
    path:          String
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

personalDetailsSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('PersonalDetails', personalDetailsSchema);
