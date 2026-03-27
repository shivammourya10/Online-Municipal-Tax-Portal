import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const updateUserToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      console.log('\nAvailable users:');
      const users = await User.find({}, 'email role');
      users.forEach(u => console.log(`- ${u.email} (${u.role})`));
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`\n✅ User ${email} updated to admin successfully!`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node updateUserRole.js <email>');
  console.log('Example: node updateUserRole.js user@example.com');
  process.exit(1);
}

updateUserToAdmin(email);
