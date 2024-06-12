-- CreateTable
CREATE TABLE "RazorpayCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RazorpayCustomer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RazorpayCustomer" ADD CONSTRAINT "RazorpayCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
