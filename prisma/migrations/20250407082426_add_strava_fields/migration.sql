-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "stravaAccessToken" TEXT,
ADD COLUMN     "stravaRefreshToken" TEXT,
ADD COLUMN     "stravaTokenExpiresAt" TIMESTAMP(3);
