import { PrismaClient, UserRoleEnum } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Superadmin123...";

  if (!email || !password) {
    throw new Error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD");
  }

  const roleNames: UserRoleEnum[] = [
    UserRoleEnum.super_admin,
    UserRoleEnum.ticket_manager,
    UserRoleEnum.developer,
    UserRoleEnum.client,
  ];

  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.roles.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // ✅ Explicit type on `r` to satisfy strict ts-node
  const superAdminRole = roles.find(
    (r: { id: string; name: UserRoleEnum }) =>
      r.name === UserRoleEnum.super_admin,
  );

  if (!superAdminRole) {
    throw new Error("super_admin role missing after seeding");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.users.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      provider: "credentials",
    },
    create: {
      firstName: "Super",
      lastName: "Admin",
      email,
      password: hashedPassword,
      provider: "credentials",
      providerId: "seeded-superadmin",
    },
  });

  const existingRole = await prisma.userRoles.findFirst({
    where: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  if (!existingRole) {
    await prisma.userRoles.create({
      data: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log("✅ Super admin ensured successfully:", email);

  // Seed realistic team members
  const devRole = roles.find((r: { id: string; name: UserRoleEnum }) => r.name === UserRoleEnum.developer)!;
  const managerRole = roles.find((r: { id: string; name: UserRoleEnum }) => r.name === UserRoleEnum.ticket_manager)!;

  const teamMembers = [
    {
      firstName: "Aline",
      lastName: "Uwimana",
      email: "aline.uwimana@supporthub.io",
      specialty: "Frontend Developer",
      roleId: devRole.id,
    },
    {
      firstName: "Jean Claude",
      lastName: "Niyonsaba",
      email: "jc.niyonsaba@supporthub.io",
      specialty: "Backend Developer",
      roleId: devRole.id,
    },
    {
      firstName: "Sarah",
      lastName: "Mukamana",
      email: "sarah.mukamana@supporthub.io",
      specialty: "UI/UX Designer",
      roleId: devRole.id,
    },
    {
      firstName: "Eric",
      lastName: "Habimana",
      email: "eric.habimana@supporthub.io",
      specialty: "QA Engineer",
      roleId: devRole.id,
    },
    {
      firstName: "Patrick",
      lastName: "Nzeyimana",
      email: "patrick.nzeyimana@supporthub.io",
      specialty: "Product Manager",
      roleId: managerRole.id,
    },
    {
      firstName: "Claudine",
      lastName: "Ingabire",
      email: "claudine.ingabire@supporthub.io",
      specialty: "ML Engineer",
      roleId: devRole.id,
    },
  ];

  const seedPassword = await bcrypt.hash("SupportHub2025!", 10);

  for (const member of teamMembers) {
    const { roleId, ...userData } = member;
    const user = await prisma.users.upsert({
      where: { email: userData.email },
      update: { specialty: userData.specialty },
      create: {
        ...userData,
        password: seedPassword,
        hasChangedPassword: true,
        provider: "credentials",
      },
    });

    const exists = await prisma.userRoles.findFirst({
      where: { userId: user.id, roleId },
    });
    if (!exists) {
      await prisma.userRoles.create({ data: { userId: user.id, roleId } });
    }
  }

  console.log("✅ Team members seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
