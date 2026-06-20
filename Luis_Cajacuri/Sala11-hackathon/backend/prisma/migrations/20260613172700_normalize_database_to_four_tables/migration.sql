/*
  Warnings:

  - You are about to drop the column `channelId` on the `CanalSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CanalSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `durationSeconds` on the `VideoSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `isShort` on the `VideoSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `publishedDate` on the `VideoSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotId` on the `VideoSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `VideoSnapshot` table. All the data in the column will be lost.
  - You are about to alter the column `videoId` on the `VideoSnapshot` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `canalId` to the `CanalSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fetchedDate` to the `VideoSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Canal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customImageUrl" TEXT
);

-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "canalId" INTEGER NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "isShort" BOOLEAN NOT NULL,
    "publishedDate" TEXT NOT NULL,
    CONSTRAINT "Video_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CanalSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "canalId" INTEGER NOT NULL,
    "subscriberCount" INTEGER NOT NULL,
    "totalViews" BIGINT NOT NULL,
    "videoCount" INTEGER NOT NULL,
    "engagementPromedio" REAL,
    "fetchedDate" TEXT NOT NULL,
    CONSTRAINT "CanalSnapshot_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CanalSnapshot" ("engagementPromedio", "fetchedDate", "id", "subscriberCount", "totalViews", "videoCount") SELECT "engagementPromedio", "fetchedDate", "id", "subscriberCount", "totalViews", "videoCount" FROM "CanalSnapshot";
DROP TABLE "CanalSnapshot";
ALTER TABLE "new_CanalSnapshot" RENAME TO "CanalSnapshot";
CREATE UNIQUE INDEX "CanalSnapshot_canalId_fetchedDate_key" ON "CanalSnapshot"("canalId", "fetchedDate");
CREATE TABLE "new_VideoSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "videoId" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "engagement" REAL,
    "fetchedDate" TEXT NOT NULL,
    CONSTRAINT "VideoSnapshot_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VideoSnapshot" ("comments", "engagement", "id", "likes", "videoId", "views") SELECT "comments", "engagement", "id", "likes", "videoId", "views" FROM "VideoSnapshot";
DROP TABLE "VideoSnapshot";
ALTER TABLE "new_VideoSnapshot" RENAME TO "VideoSnapshot";
CREATE UNIQUE INDEX "VideoSnapshot_videoId_fetchedDate_key" ON "VideoSnapshot"("videoId", "fetchedDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Canal_platform_channelId_key" ON "Canal"("platform", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Video_canalId_videoId_key" ON "Video"("canalId", "videoId");
