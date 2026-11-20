import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@ratemyshelf.local";
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "AdminPassword123!";

  console.log(`Setting up admin user: ${email} (${username})...`);

  const passwordHash = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      role: Role.ADMIN,
      isVerified: true,
      isBanned: false,
      passwordHash,
    },
    create: {
      email,
      username,
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      accountCreatedAt: new Date(Date.now() - 30 * 86_400_000), // 30 days old to pass any age gate
    },
  });

  console.log("Admin account successfully configured:");
  console.log(`- Email:    ${admin.email}`);
  console.log(`- Username: ${admin.username}`);
  console.log(`- Role:     ${admin.role}`);
  console.log(`- Password: ${password}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
