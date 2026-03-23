-- CreateEnum
CREATE TYPE "Language" AS ENUM ('JAPANESE', 'ENGLISH', 'KOREAN', 'CHINESE', 'SPANISH');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'ENGLISH';
