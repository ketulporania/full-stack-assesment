const PersonalDetails = require('../models/PersonalDetails');

exports.saveProfile = async (req, res) => {
  try {
    const { full_name, date_of_birth, email, phone_number, address } = req.body;
    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 0, message: 'Attachment is required' });
    }

    const profile = await PersonalDetails.findOneAndUpdate(
      { user_id },
      {
        $set: {
          full_name,
          date_of_birth,
          email,
          phone_number,
          address,
          attachment: {
            file_name:     req.file.filename,
            original_name: req.file.originalname,
            mime_type:     req.file.mimetype,
            size:          req.file.size,
            path:          req.file.path
          },
          updated_at: Date.now()
        },
        $setOnInsert: { user_id, created_at: Date.now() }
      },
      { returnDocument: 'after', upsert: true, lean: true }
    );

    res.status(201).json({ success: 1, message: 'Profile saved successfully', data: profile });
  } catch (err) {
    console.error('saveProfile error:', err);
    res.status(500).json({ error: 0, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await PersonalDetails.findOne({ user_id: req.user.id }).lean();

    if (!profile) {
      return res.status(404).json({ error: 0, message: 'Profile not found' });
    }

    res.json(profile);
  } catch {
    res.status(500).json({ error: 0, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, date_of_birth, email, phone_number, address } = req.body;

    const update = {
      full_name,
      date_of_birth,
      email,
      phone_number,
      address,
      updated_at: Date.now()
    };

    if (req.file) {
      update.attachment = {
        file_name:     req.file.filename,
        original_name: req.file.originalname,
        mime_type:     req.file.mimetype,
        size:          req.file.size,
        path:          req.file.path
      };
    }

    const profile = await PersonalDetails.findOneAndUpdate(
      { user_id: req.user.id },
      { $set: update },
      { returnDocument: 'after', lean: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 0, message: 'Profile not found' });
    }

    res.json({ success: 1, message: 'Profile updated successfully', data: profile });
  } catch {
    res.status(500).json({ error: 0, message: 'Server error' });
  }
};
