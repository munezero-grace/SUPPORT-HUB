import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function getClientById(
  clientId: string,
  includeSoftDeleted = false
) {
  return prisma.clients.findFirst({
    where: {
      id: clientId,
      ...(includeSoftDeleted ? {} : { deletedAt: null }),
    },
    include: {
      user: true,
      clientProducts: { include: { product: true } },
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email },
  });
}

export const userInfoSelect = {
  firstName: true,
  lastName: true,
  email: true,
};

export async function softDeleteClientById(clientId: string) {
  return prisma.clients.update({
    where: { id: clientId },
    data: {
      deletedAt: new Date(),
      status: "inactive",
    },
    include: {
      user: { select: userInfoSelect },
    },
  });
}

export async function restoreClientById(clientId: string) {
  return prisma.clients.update({
    where: { id: clientId },
    data: {
      deletedAt: null,
      status: "active",
    },
    include: {
      user: { select: userInfoSelect },
    },
  });
}

export async function addProductToClientHelper(clientId: string, productId: string) {
  return prisma.clientProduct.create({
    data: {
      clientId,
      productId,
    },
  });
}

export async function removeProductFromClientHelper(clientId: string, productId: string) {
  const productCount = await prisma.clientProduct.count({
    where: { clientId },
  });
  if (productCount <= 1) {
    throw new Error(
      "Cannot remove the last product from a client. A client must have at least one product."
    );
  }
  return prisma.clientProduct.delete({
    where: {
      clientId_productId: {
        clientId,
        productId,
      },
    },
  });
}
