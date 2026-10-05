import { PrismaClient } from "@prisma/client";
import { DEFAULT_CRITERIA, DEFAULT_TEAMS, DEFAULT_USERS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting LAN Datathon 2026 database seed...");

  // Seed Users
  for (const user of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      create: user,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_USERS.length} users (Juri 1-4 & Admin).`);

  // Seed Criteria
  for (const criterion of DEFAULT_CRITERIA) {
    await prisma.criterion.upsert({
      where: { code: criterion.code },
      update: {
        name: criterion.name,
        weight: criterion.weight,
        order: criterion.order,
        description: criterion.description,
      },
      create: criterion,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_CRITERIA.length} evaluation criteria.`);

  // Seed Teams
  for (const team of DEFAULT_TEAMS) {
    await prisma.team.upsert({
      where: { orderNo: team.orderNo },
      update: {
        name: team.name,
        institution: team.institution,
        description: team.description,
      },
      create: team,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_TEAMS.length} participating teams.`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
