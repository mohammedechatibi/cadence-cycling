CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'ai' NOT NULL,
	`video_url` text,
	`video_id` text,
	`category` text NOT NULL,
	`note` text,
	`rank` integer DEFAULT 0 NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`channel` text,
	`duration` text
);
