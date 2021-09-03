CREATE DATABASE IF NOT EXISTS `simplechat` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `simplechat`;

CREATE TABLE IF NOT EXISTS `accounts` (
 `id` int(11) NOT NULL,
 `username` varchar(50) NOT NULL,
 `password` varchar(255) NOT NULL,
 `email` varchar(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `message` varchar(300) NOT NULL,
  `date` varchar(50) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
ALTER TABLE `messages` ADD PRIMARY KEY (`id`);
ALTER TABLE `messages` MODIFY `id` int(50) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
