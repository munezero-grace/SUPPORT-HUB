import { PrismaClient, UserRoleEnum, ProductStatus, ClientStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // ── DELETE ALL EXISTING DATA (FK-safe order) ──────────────────────────────
  console.log("🗑️  Deleting all existing data...");

  const d1  = await prisma.ticketNote.deleteMany();
  const d2  = await prisma.ticketComment.deleteMany();
  const d3  = await prisma.ticketAttachment.deleteMany();
  const d4  = await prisma.notification.deleteMany();
  const d5  = await prisma.userTickets.deleteMany();
  const d6  = await prisma.tickets.deleteMany();
  const d7  = await prisma.clientProduct.deleteMany();
  const d8  = await prisma.clients.deleteMany();
  const d9  = await prisma.userRoles.deleteMany();
  const d10 = await prisma.users.deleteMany();
  const d11 = await prisma.products.deleteMany();
  const d12 = await prisma.roles.deleteMany();

  const totalDeleted =
    d1.count + d2.count + d3.count + d4.count + d5.count + d6.count +
    d7.count + d8.count + d9.count + d10.count + d11.count + d12.count;

  console.log(`   ticketNotes=${d1.count}  ticketComments=${d2.count}  ticketAttachments=${d3.count}`);
  console.log(`   notifications=${d4.count}  userTickets=${d5.count}  tickets=${d6.count}`);
  console.log(`   clientProducts=${d7.count}  clients=${d8.count}  userRoles=${d9.count}`);
  console.log(`   users=${d10.count}  products=${d11.count}  roles=${d12.count}`);
  console.log(`✅ ${totalDeleted} records deleted\n`);

  // ── ROLES ─────────────────────────────────────────────────────────────────
  const roleNames: UserRoleEnum[] = [
    UserRoleEnum.super_admin,
    UserRoleEnum.ticket_manager,
    UserRoleEnum.developer,
    UserRoleEnum.client,
  ];

  const roles = await Promise.all(
    roleNames.map((name) => prisma.roles.create({ data: { name } }))
  );

  const superAdminRole = roles.find((r) => r.name === UserRoleEnum.super_admin)!;
  const devRole        = roles.find((r) => r.name === UserRoleEnum.developer)!;
  const managerRole    = roles.find((r) => r.name === UserRoleEnum.ticket_manager)!;
  const clientRole     = roles.find((r) => r.name === UserRoleEnum.client)!;

  const defaultPassword = await bcrypt.hash("default123", 10);

  // ── SUPER ADMIN ───────────────────────────────────────────────────────────
  const superAdmin = await prisma.users.create({
    data: {
      firstName: "Super",
      lastName: "Admin",
      email: "ineza.agape1@gmail.com",
      password: defaultPassword,
      provider: "credentials",
      providerId: "seeded-superadmin",
      hasChangedPassword: true,
      specialty: "System Administrator",
    },
  });
  await prisma.userRoles.create({ data: { userId: superAdmin.id, roleId: superAdminRole.id } });
  console.log("✅ Super admin:", superAdmin.email);

  // ── STAFF ─────────────────────────────────────────────────────────────────
  const staffMembers = [
    { firstName: "Grace",     lastName: "Munezero", email: "munezero.grace911@gmail.com", specialty: "Full Stack Developer",  roleId: devRole.id },
    { firstName: "Tresor",    lastName: "Ruhara",   email: "tresor@supporthub.io",         specialty: "Backend Developer",     roleId: devRole.id },
    { firstName: "Rene",      lastName: "Gisa",     email: "rene@supporthub.io",           specialty: "Frontend Developer",    roleId: devRole.id },
    { firstName: "Dominique", lastName: "Uwimana",  email: "dom@supporthub.io",            specialty: "Ticket-manager",        roleId: devRole.id },
    { firstName: "Briella",   lastName: "Keza",     email: "briella@supporthub.io",        specialty: "QA Engineer",           roleId: devRole.id },
    { firstName: "Gislain",   lastName: "Ntwali",   email: "gislain@supporthub.io",        specialty: "UI/UX Designer",        roleId: devRole.id },
    { firstName: "Elvis",     lastName: "Murenzi",  email: "elvis@supporthub.io",          specialty: "Full Stack Developer",  roleId: managerRole.id },
  ];

  for (const member of staffMembers) {
    const { roleId, specialty, ...userData } = member;
    const user = await prisma.users.create({
      data: {
        ...userData,
        specialty,
        password: defaultPassword,
        provider: "credentials",
        hasChangedPassword: true,
      },
    });
    await prisma.userRoles.create({ data: { userId: user.id, roleId } });
  }
  console.log(`✅ ${staffMembers.length} staff members created`);

  // ── CLIENTS + PRODUCTS ────────────────────────────────────────────────────
  const clientSeedData = [
    {
      firstName: "SafiBank",  lastName: undefined,
      email: "support@safibank.rw",
      companyName: "SafiBank Ltd",
      productName: "SafiBank App",
      productCode: "P-1001",
      clientCode:  "C-1001",
    },
    {
      firstName: "HealthPlus", lastName: undefined,
      email: "it@healthplus.rw",
      companyName: "HealthPlus Rwanda",
      productName: "HealthPlus System",
      productCode: "P-1002",
      clientCode:  "C-1002",
    },
    {
      firstName: "TeleConnect", lastName: undefined,
      email: "helpdesk@teleconnect.rw",
      companyName: "TeleConnect Rwanda",
      productName: "TeleConnect",
      productCode: "P-1003",
      clientCode:  "C-1003",
    },
    {
      firstName: "AgriTech", lastName: undefined,
      email: "support@agritech.rw",
      companyName: "AgriTech Solutions",
      productName: "AgriMarket",
      productCode: "P-1004",
      clientCode:  "C-1004",
    },
    {
      firstName: "EduLearn", lastName: undefined,
      email: "tech@edulearn.rw",
      companyName: "EduLearn Africa",
      productName: "EduLearn System",
      productCode: "P-1005",
      clientCode:  "C-1005",
    },
    {
      firstName: "RwandaShop", lastName: undefined,
      email: "support@rwandashop.rw",
      companyName: "RwandaShop Online",
      productName: "RwandaShop Platform",
      productCode: "P-1006",
      clientCode:  "C-1006",
    },
    {
      firstName: "Benitha", lastName: "Ngunga",
      email: "benitha@gmail.com",
      companyName: "IKIMINA",
      productName: "IKIMINA WALLET",
      productCode: "P-1007",
      clientCode:  "C-1007",
    },
    {
      firstName: "Grace", lastName: "Munezero",
      email: "gracemunezero88@gmail.com",
      companyName: "Grace Munezero",
      productName: "Vuba Vuba",
      productCode: "P-1008",
      clientCode:  "C-1008",
    },
  ];

  for (const data of clientSeedData) {
    const product = await prisma.products.create({
      data: {
        productCode: data.productCode,
        name: data.productName,
        status: ProductStatus.active,
      },
    });

    const user = await prisma.users.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: defaultPassword,
        provider: "credentials",
        hasChangedPassword: true,
      },
    });
    await prisma.userRoles.create({ data: { userId: user.id, roleId: clientRole.id } });

    const client = await prisma.clients.create({
      data: {
        clientCode: data.clientCode,
        companyName: data.companyName,
        status: ClientStatus.active,
        userId: user.id,
      },
    });

    await prisma.clientProduct.create({
      data: { clientId: client.id, productId: product.id },
    });
  }

  console.log(`✅ ${clientSeedData.length} clients created`);
  console.log(`✅ ${clientSeedData.length} products created`);

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const totalUsers = 1 + staffMembers.length + clientSeedData.length;
  console.log("\n📊 Seed complete:");
  console.log(`   Users:    ${totalUsers} (1 super admin + ${staffMembers.length} staff + ${clientSeedData.length} clients)`);
  console.log(`   Products: ${clientSeedData.length}`);
  console.log(`   Clients:  ${clientSeedData.length}`);
  console.log("   Password: default123 (all users)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
