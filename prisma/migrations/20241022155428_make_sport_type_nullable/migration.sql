-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('RUNNING', 'CYCLING', 'SWIMMING', 'TRIATHLON');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'TRIATHLON';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "distance" TEXT,
ADD COLUMN     "sportType" "SportType";
