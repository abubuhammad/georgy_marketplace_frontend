// Database configuration - MySQL with Prisma only
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

console.log('🗄️ Running with MySQL database via Prisma.');

export { isDevMode };
