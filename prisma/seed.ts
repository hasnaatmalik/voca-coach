import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating admin user...');

  const adminEmail = 'hasnaatmalik2003@gmail.com';
  const adminPassword = '123456';
  const adminName = 'Hasnaat Malik';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          isAdmin: true,
          role: 'admin',
        },
      });
      console.log(`✅ Updated existing user ${adminEmail} to admin`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'admin',
          isAdmin: true,
          isTherapist: false,
        },
      });
      console.log(`✅ Created new admin user: ${adminEmail}`);
    }

    console.log('✨ Admin setup complete!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
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
