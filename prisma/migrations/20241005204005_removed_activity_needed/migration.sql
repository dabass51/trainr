/*
  Warnings:

  - Made the column `activityType` on table `activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "activityType" SET NOT NULL;
