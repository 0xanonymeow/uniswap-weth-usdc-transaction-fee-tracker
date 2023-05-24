-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "confirmations" SET DEFAULT '0',
ALTER COLUMN "confirmations" SET DATA TYPE TEXT;
