require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Admin = mongoose.model('Admin', new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: String
  }));

  const hash = await bcrypt.hash('Intasia@Admin2026', 12);
  const result = await Admin.updateOne(
    { email: 'admin@intasia.in' },
    { $set: { password: hash } }
  );
  console.log('Updated:', result.modifiedCount, 'admin(s)');
  process.exit(0);
});