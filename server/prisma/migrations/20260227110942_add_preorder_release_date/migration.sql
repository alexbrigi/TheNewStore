-- AlterTable
ALTER TABLE "products" ADD COLUMN     "preorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releaseDate" TIMESTAMP(3);
