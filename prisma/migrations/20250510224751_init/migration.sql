-- CreateTable
CREATE TABLE `Warn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` TEXT NOT NULL,
    `issuerId` VARCHAR(255) NOT NULL,
    `targetId` VARCHAR(255) NOT NULL,
    `issuedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Warn_targetId_idx`(`targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(255) NOT NULL,
    `warns` INTEGER NOT NULL DEFAULT 0,
    `timeouts` INTEGER NOT NULL DEFAULT 0,
    `messageCount` INTEGER NOT NULL DEFAULT 0,
    `lastMessageAt` TIMESTAMP NULL,
    `joinedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `riskScore` INTEGER NOT NULL DEFAULT 0,
    `lastScan` TIMESTAMP NULL,

    INDEX `User_riskScore_idx`(`riskScore`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ban` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` TEXT NOT NULL,
    `issuerId` VARCHAR(255) NOT NULL,
    `targetId` VARCHAR(255) NOT NULL,
    `issuedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Ban_targetId_idx`(`targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Warn` ADD CONSTRAINT `Warn_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
