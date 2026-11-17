CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text,
	`includes` text,
	`image_urls` text,
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`checkout_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text,
	`amount_cents` integer,
	`currency` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`buyer_email` text,
	`paid_at` text,
	`created_date` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_checkout_id_unique` ON `purchases` (`checkout_id`);