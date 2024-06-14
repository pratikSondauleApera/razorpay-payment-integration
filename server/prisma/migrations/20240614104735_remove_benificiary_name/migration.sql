/*
  Warnings:

  - You are about to drop the column `benificiaryName` on the `RazorpayCustomerIdentifier` table. All the data in the column will be lost.
  - Added the required column `userId` to the `RazorpayCustomerIdentifier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RazorpayCustomerIdentifier" DROP COLUMN "benificiaryName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RazorpayCustomerIdentifier" ADD CONSTRAINT "RazorpayCustomerIdentifier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
