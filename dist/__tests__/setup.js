"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Load test environment variables
dotenv_1.default.config({ path: '.env.test' });
// Create a new Prisma client for testing
const prisma = new client_1.PrismaClient();
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
