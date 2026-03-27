import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
  },
  isEmailVerified: Boolean,
  isActive: Boolean,
});

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@itms.gov.in' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email: admin@itms.gov.in');
      console.log('Updating to admin role...');
      
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ User updated to admin role');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const adminUser = new User({
        email: 'admin@itms.gov.in',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '9999999999',
        },
        isEmailVerified: true,
        isActive: true,
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('Email: admin@itms.gov.in');
      console.log('Password: Admin@123');
    }

    console.log('\n🌐 Now you can:');
    console.log('1. Go to http://localhost:5173/login');
    console.log('2. Login with the admin credentials');
    console.log('3. Access admin dashboard at /admin/dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
