const mongoose = require('mongoose');

let memoryServer;

const connectDB = async () => {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  let uri = process.env.MONGO_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: { launchTimeout: 120000 }
    });
    uri = memoryServer.getUri();
    console.log('Using in-memory MongoDB for development');
  }

  await mongoose.connect(uri, options);
  console.log(`Connected to MongoDB (${mongoose.connection.name})`);

  await syncPersonalDetailsIndexes();
};

async function syncPersonalDetailsIndexes() {
  const PersonalDetails = require('../models/PersonalDetails');

  const duplicateGroups = await PersonalDetails.aggregate([
    { $sort: { updated_at: -1 } },
    { $group: { _id: '$user_id', docIds: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  for (const group of duplicateGroups) {
    const [, ...removeIds] = group.docIds;
    if (removeIds.length) {
      await PersonalDetails.deleteMany({ _id: { $in: removeIds } });
      console.log(`Removed ${removeIds.length} duplicate profile(s) for user ${group._id}`);
    }
  }

  try {
    const indexes = await PersonalDetails.collection.indexes();
    const userIdIndex = indexes.find(index => index.key?.user_id === 1);

    if (userIdIndex && !userIdIndex.unique) {
      await PersonalDetails.collection.dropIndex('user_id_1');
      console.log('Restored unique one-profile-per-user index on personaldetails.user_id');
    }
  } catch (err) {
    if (err.code !== 27) {
      console.warn('Could not update personaldetails.user_id index:', err.message);
    }
  }

  await PersonalDetails.syncIndexes();
}

module.exports = connectDB;
