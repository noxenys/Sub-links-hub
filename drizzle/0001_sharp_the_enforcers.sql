CREATE TABLE `subscription_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`icon` varchar(32) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`protocol` varchar(64) NOT NULL,
	`stability` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`tags` varchar(500) NOT NULL,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `subscription_links` ADD CONSTRAINT `subscription_links_categoryId_subscription_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `subscription_categories`(`id`) ON DELETE cascade ON UPDATE no action;