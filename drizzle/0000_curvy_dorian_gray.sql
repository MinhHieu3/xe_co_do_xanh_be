CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text NOT NULL,
	`type` text NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`time_start` text,
	`time_end` text,
	`status` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`cccd` text,
	`email` text,
	`quantity` text,
	`location` text,
	`type_category` text,
	`des_1` text,
	`des_2` text,
	`des_3` text
);
--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_ids` text,
	`id_order` integer,
	`status` integer DEFAULT false NOT NULL,
	`payment` integer DEFAULT false NOT NULL,
	`time_payment` text,
	`des_1` text,
	`des_2` text,
	`des_3` text,
	FOREIGN KEY (`id_order`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_plate` text NOT NULL,
	`status` integer DEFAULT false NOT NULL,
	`id_category` integer NOT NULL,
	`daily_rate` text,
	`monthly_rate` text,
	`hourly_rate` text,
	`des_1` text,
	`des_2` text,
	FOREIGN KEY (`id_category`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
