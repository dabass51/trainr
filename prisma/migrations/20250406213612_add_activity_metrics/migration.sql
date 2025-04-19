/*
  Warnings:

  - Added the required column `duration` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "avgCadence" INTEGER,
ADD COLUMN     "avgHeartRate" INTEGER,
ADD COLUMN     "avgPower" INTEGER,
ADD COLUMN     "avgSpeed" DOUBLE PRECISION,
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "elevationGain" DOUBLE PRECISION,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "maxCadence" INTEGER,
ADD COLUMN     "maxHeartRate" INTEGER,
ADD COLUMN     "maxPower" INTEGER,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trainingUnitId" TEXT;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_trainingUnitId_fkey" FOREIGN KEY ("trainingUnitId") REFERENCES "TrainingUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
