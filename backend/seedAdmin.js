const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const users = [
  { name: 'Pablo Sanz Aznar', email: 'admin@feriaapp.com', password: 'admin1234', role: 'admin' },
  { name: 'Editor User', email: 'editor@feriaapp.com', password: 'editor1234', role: 'editor' },
  { name: 'Viewer User', email: 'viewer@feriaapp.com', password: 'viewer1234', role: 'viewer' },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      await mongoose.connection.collection('users').updateOne(
        { email: user.email },
        {
          $set: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      console.log(`Seeded ${user.role}: ${user.email}`);
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
