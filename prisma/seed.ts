import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating superadmin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  // Warn if using default credentials
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
    console.log('⚠️  Warning: Using default admin credentials.');
    console.log('   To use custom credentials, add these to your .env.local:');
    console.log('   ADMIN_EMAIL=your_email@example.com');
    console.log('   ADMIN_PASSWORD=your_secure_password');
    console.log('   ADMIN_NAME=Your Name\n');
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Update existing user to superadmin
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          isAdmin: true,
          isSuperAdmin: true,
          role: 'superadmin',
        },
      });
      console.log(`✅ Updated existing user ${adminEmail} to superadmin`);
    } else {
      // Create new superadmin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'superadmin',
          isAdmin: true,
          isSuperAdmin: true,
          isTherapist: false,
        },
      });
      console.log(`✅ Created new superadmin user: ${adminEmail}`);
    }

    console.log('✨ Superadmin setup complete!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
