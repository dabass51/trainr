/*
  Warnings:

  - You are about to drop the column `stravaAccessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stravaRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stravaTokenExpiresAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "stravaAccessToken",
DROP COLUMN "stravaRefreshToken",
DROP COLUMN "stravaTokenExpiresAt",
ADD COLUMN     "strava_access_token" TEXT,
ADD COLUMN     "strava_refresh_token" TEXT,
ADD COLUMN     "strava_token_expires_at" TIMESTAMP(3);
