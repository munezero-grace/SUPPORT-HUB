-- AlterEnum
ALTER TYPE "StatusEnum" ADD VALUE 'closed';

-- AlterTable
ALTER TABLE "Tickets" ALTER COLUMN "status" SET DEFAULT 'new';
