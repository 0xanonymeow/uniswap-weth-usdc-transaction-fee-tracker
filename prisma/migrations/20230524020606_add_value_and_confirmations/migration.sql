-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "confirmations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "value" TEXT NOT NULL DEFAULT '0';
