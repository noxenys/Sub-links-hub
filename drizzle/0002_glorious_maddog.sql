CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255),
	`type` enum('info','success','warning','error','system') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`actionUrl` varchar(500),
	`isRead` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeProductId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('one-time','subscription') NOT NULL DEFAULT 'one-time',
	`stripePriceId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`interval` enum('day','week','month','year'),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_products_stripeProductId_unique` UNIQUE(`stripeProductId`)
);
--> statement-breakpoint
CREATE TABLE `stripe_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`productId` int NOT NULL,
	`status` enum('active','past_due','canceled','unpaid') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
CREATE TABLE `stripe_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`productId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'usd',
	`status` enum('succeeded','processing','requires_payment_method','failed') NOT NULL DEFAULT 'processing',
	`receiptUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_transactions_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
ALTER TABLE `stripe_subscriptions` ADD CONSTRAINT `stripe_subscriptions_productId_stripe_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `stripe_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `stripe_transactions_productId_stripe_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `stripe_products`(`id`) ON DELETE no action ON UPDATE no action;