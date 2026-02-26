-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `ban` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`reason` text NOT NULL,
	`issuerId` varchar(255) NOT NULL,
	`targetId` varchar(255) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`warns` int(11) NOT NULL DEFAULT 0,
	`timeouts` int(11) NOT NULL DEFAULT 0,
	`joinedAt` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `warn` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`reason` text NOT NULL,
	`issuerId` varchar(255) NOT NULL,
	`targetId` varchar(255) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `_prisma_migrations` (
	`id` varchar(36) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`finished_at` datetime(3) DEFAULT 'NULL',
	`migration_name` varchar(255) NOT NULL,
	`logs` text DEFAULT 'NULL',
	`rolled_back_at` datetime(3) DEFAULT 'NULL',
	`started_at` datetime(3) NOT NULL DEFAULT 'current_timestamp(3)',
	`applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE `warn` ADD CONSTRAINT `Warn_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `Ban_targetId_idx` ON `ban` (`targetId`);--> statement-breakpoint
CREATE INDEX `Warn_targetId_idx` ON `warn` (`targetId`);
*/