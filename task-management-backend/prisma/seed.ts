import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);
  const userEmail = 'rafi@example.com';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: 'System Admin',
    },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: 'System Admin',
    },
  });

  console.log(
    existingAdmin ? 'Admin already existed' : 'Admin created',
  );

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
      name: 'Normal User',
    },
    create: {
      email: 'rafi@example.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      name: 'Normal User',
    },
  });

  console.log(existingUser ? 'User already existed' : 'User created');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
