import * as dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma";

async function main() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      hasChangedPassword: true,
      provider: true,
      createdAt: true,
      deletedAt: true,
    },
  });
  for (const user of users) console.log(user);
  console.log("Total:", users.length);

  const colDefault = await prisma.$queryRaw`
    SELECT column_default, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'Users' AND column_name = 'hasChangedPassword'
  `;
  console.log("column info:", colDefault);

  const raw = await prisma.$queryRaw`
    SELECT id, email, "hasChangedPassword" FROM "Users" WHERE email = 'ineza.agape1@gmail.com'
  `;
  console.log("raw row:", raw);
}

main().finally(() => prisma.$disconnect());
