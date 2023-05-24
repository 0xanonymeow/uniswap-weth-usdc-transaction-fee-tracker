/*
  Warnings:

  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_pkey",
DROP COLUMN "id",
ADD COLUMN     "from" TEXT NOT NULL DEFAULT '0x0',
ADD COLUMN     "tokenDecimal" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "tokenName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tokenSymbol" TEXT NOT NULL DEFAULT '',
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash", "from");
