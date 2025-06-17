/*
  Warnings:

  - You are about to alter the column `issuedAt` on the `ban` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `lastMessageAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastScan` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `messageCount` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `riskScore` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `joinedAt` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `issuedAt` on the `warn` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropIndex
DROP INDEX `User_riskScore_idx` ON `user`;

-- AlterTable
ALTER TABLE `ban` MODIFY `issuedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `lastMessageAt`,
    DROP COLUMN `lastScan`,
    DROP COLUMN `messageCount`,
    DROP COLUMN `riskScore`,
    MODIFY `joinedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `warn` MODIFY `issuedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
