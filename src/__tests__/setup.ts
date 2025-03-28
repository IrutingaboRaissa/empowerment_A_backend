import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create a new Prisma client for testing
const prisma = new PrismaClient();

// Clean up the database before each test
global.beforeAll(async () => {
  // Clean up all tables
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

// Close the Prisma connection after all tests
global.afterAll(async () => {
  await prisma.$disconnect();
}); 