-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RUNNING', 'CYCLING', 'SWIMMING');

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "activityType" "ActivityType";
