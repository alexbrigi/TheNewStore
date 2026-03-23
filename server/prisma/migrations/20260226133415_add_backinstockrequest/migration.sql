-- CreateTable
CREATE TABLE "back_in_stock_requests" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "back_in_stock_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
