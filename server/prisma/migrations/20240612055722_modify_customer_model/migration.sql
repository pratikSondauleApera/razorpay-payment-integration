/*
  Warnings:

  - Added the required column `customerId` to the `RazorpayCustomer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity` to the `RazorpayCustomer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RazorpayCustomer" ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "entity" TEXT NOT NULL;
