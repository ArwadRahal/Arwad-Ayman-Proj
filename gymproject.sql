-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2025 at 04:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gymproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) DEFAULT NULL,
  `ImageURL` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`CategoryID`, `CategoryName`, `ImageURL`) VALUES
(1, 'אבקות חלבון', '1749900484725.webp'),
(2, 'משקאות חלבון', '1749900504812.webp'),
(3, 'חטיפי חלבון', '1749915400177.png'),
(4, 'אולאין אינרג\'י', '1751130658231.png'),
(5, 'תוספי תזונה', '1754914500056.png'),
(6, 'ג\'ל אנרגיה', '1754914750950.png');

-- --------------------------------------------------------

--
-- Table structure for table `exerciseparticipants`
--

CREATE TABLE `exerciseparticipants` (
  `ExerciseID` int(11) NOT NULL,
  `TraineeID` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exerciseparticipants`
--

INSERT INTO `exerciseparticipants` (`ExerciseID`, `TraineeID`) VALUES
(26, '242422'),
(27, '242422'),
(29, '242422'),
(30, '242422'),
(31, '242422'),
(32, '0987654333'),
(32, '242422'),
(38, '0987654333'),
(38, '123456788'),
(46, '12345678'),
(46, '242422'),
(46, '347217394'),
(46, '362837103'),
(47, '324762312'),
(47, '41272862'),
(50, '12345678'),
(50, '242422'),
(52, '0987654333'),
(52, '41272862'),
(53, '12345678'),
(53, '242422'),
(53, '347217394'),
(54, '2132182735'),
(54, '242422'),
(55, '123456788'),
(56, '0987654333'),
(56, '41272862'),
(57, '2132182735'),
(57, '347217394'),
(57, '362837103'),
(86, '12345678'),
(86, '242422'),
(87, '123456788'),
(88, '2132182735'),
(88, '242422'),
(88, '347217394'),
(88, '362837103'),
(89, '0987654333'),
(90, '12345678'),
(90, '2132182735'),
(90, '242422'),
(90, '362837103'),
(91, '123456788'),
(92, '0987654333'),
(92, '41272862'),
(93, '12345678'),
(93, '2132182735'),
(94, '123456788'),
(95, '2132182735'),
(95, '242422'),
(95, '347217394'),
(96, '242422'),
(97, '0987654333'),
(98, '123456788'),
(99, '242422'),
(100, '12345678'),
(101, '123456788'),
(103, '2132182735'),
(103, '242422'),
(104, '123456788'),
(105, '2132182735'),
(107, '2132182735'),
(112, '242422'),
(124, '242422'),
(127, '242422'),
(127, '347217394'),
(128, '242422'),
(129, '347217394');

-- --------------------------------------------------------

--
-- Table structure for table `exercises`
--

CREATE TABLE `exercises` (
  `ExerciseID` int(11) NOT NULL,
  `Date` date DEFAULT NULL,
  `StartTime` time DEFAULT NULL,
  `EndTime` time DEFAULT NULL,
  `CoachID` varchar(20) DEFAULT NULL,
  `AllowedMembership` enum('Group','Couple','Single') DEFAULT 'Group',
  `ExerciseTypeID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exercises`
--

INSERT INTO `exercises` (`ExerciseID`, `Date`, `StartTime`, `EndTime`, `CoachID`, `AllowedMembership`, `ExerciseTypeID`) VALUES
(26, '2025-06-11', '12:00:00', '13:00:00', '213417292', 'Group', 6),
(27, '2025-06-26', '12:00:00', '13:00:00', '213417292', 'Group', 6),
(29, '2025-06-18', '12:00:00', '13:00:00', '213417292', 'Single', 6),
(30, '2025-06-28', '12:00:00', '13:00:00', '213417292', 'Group', 4),
(31, '2025-06-28', '13:00:00', '14:00:00', '21345689', 'Single', 4),
(32, '2025-08-08', '10:00:00', '11:00:00', '213417292', 'Group', 4),
(35, '2025-07-08', '12:00:00', '15:00:00', '213417292', 'Couple', 4),
(38, '2025-08-10', '08:00:00', '09:00:00', '213417292', 'Couple', 6),
(39, '2025-08-01', '11:00:00', '12:00:00', '213417292', 'Group', 4),
(41, '2025-08-02', '10:00:00', '11:00:00', '2134334332', 'Group', 5),
(42, '2025-08-03', '07:00:00', '08:00:00', '2134334332', 'Couple', 4),
(43, '2025-08-03', '11:00:00', '12:00:00', '2134334332', 'Group', 2),
(44, '2025-08-03', '16:00:00', '17:00:00', '2134334332', 'Single', 6),
(45, '2025-08-01', '09:00:00', '10:00:00', '21345689', 'Group', 7),
(46, '2025-08-21', '12:00:00', '13:00:00', '2134334332', 'Group', 5),
(47, '2025-08-09', '08:00:00', '09:00:00', '213417292', 'Couple', 3),
(48, '2025-08-07', '14:00:00', '15:00:00', '21345689', 'Couple', 2),
(49, '2025-08-07', '12:00:00', '13:00:00', '21345689', 'Group', 1),
(50, '2025-08-11', '08:00:00', '09:00:00', '2134334332', 'Group', 7),
(51, '2025-08-11', '10:00:00', '11:00:00', '213417292', 'Single', 2),
(52, '2025-08-12', '11:00:00', '12:00:00', '2134334332', 'Couple', 3),
(53, '2025-08-12', '16:00:00', '17:00:00', '21345689', 'Group', 5),
(54, '2025-08-13', '13:00:00', '14:00:00', '213417292', 'Group', 4),
(55, '2025-08-14', '12:00:00', '13:00:00', '21345689', 'Single', 6),
(56, '2025-08-15', '15:00:00', '16:00:00', '2134334332', 'Couple', 1),
(57, '2025-08-16', '08:00:00', '09:00:00', '213417292', 'Group', 7),
(58, '2025-07-10', '08:00:00', '09:00:00', '2134334332', 'Group', 1),
(59, '2025-07-10', '10:00:00', '11:00:00', '213417292', 'Single', 2),
(60, '2025-07-11', '08:00:00', '09:00:00', '2134334332', 'Group', 3),
(61, '2025-07-11', '13:00:00', '14:00:00', '21345689', 'Couple', 4),
(62, '2025-07-12', '08:00:00', '09:00:00', '213417292', 'Group', 5),
(63, '2025-07-12', '11:00:00', '12:00:00', '21345689', 'Single', 6),
(64, '2025-07-13', '08:00:00', '09:00:00', '2134334332', 'Couple', 7),
(65, '2025-07-13', '10:00:00', '11:00:00', '2134334332', 'Group', 1),
(66, '2025-07-14', '15:00:00', '16:00:00', '213417292', 'Group', 2),
(67, '2025-07-14', '16:00:00', '17:00:00', '21345689', 'Single', 3),
(68, '2025-07-15', '10:00:00', '11:00:00', '2134334332', 'Couple', 4),
(69, '2025-07-15', '12:00:00', '13:00:00', '213417292', 'Group', 5),
(70, '2025-07-16', '14:00:00', '15:00:00', '21345689', 'Single', 6),
(71, '2025-07-16', '17:00:00', '18:00:00', '2134334332', 'Group', 7),
(72, '2025-08-01', '09:00:00', '10:00:00', '2134334332', 'Group', 1),
(73, '2025-08-01', '11:00:00', '12:00:00', '21345689', 'Couple', 2),
(74, '2025-08-02', '08:00:00', '09:00:00', '213417292', 'Group', 3),
(75, '2025-08-02', '10:00:00', '11:00:00', '2134334332', 'Single', 4),
(76, '2025-08-03', '12:00:00', '13:00:00', '21345689', 'Group', 5),
(77, '2025-08-03', '13:00:00', '14:00:00', '213417292', 'Couple', 6),
(78, '2025-08-04', '16:00:00', '17:00:00', '2134334332', 'Group', 7),
(79, '2025-08-04', '17:00:00', '18:00:00', '21345689', 'Single', 1),
(80, '2025-08-05', '10:00:00', '11:00:00', '2134334332', 'Group', 2),
(81, '2025-08-05', '11:00:00', '12:00:00', '213417292', 'Couple', 3),
(82, '2025-08-06', '08:00:00', '09:00:00', '2134334332', 'Group', 4),
(83, '2025-08-06', '09:00:00', '10:00:00', '21345689', 'Single', 5),
(84, '2025-08-07', '13:00:00', '14:00:00', '213417292', 'Group', 6),
(85, '2025-08-07', '14:00:00', '15:00:00', '21345689', 'Couple', 7),
(86, '2025-08-08', '15:00:00', '16:00:00', '2134334332', 'Group', 1),
(87, '2025-08-08', '17:00:00', '18:00:00', '213417292', 'Single', 2),
(88, '2025-08-09', '10:00:00', '11:00:00', '21345689', 'Group', 3),
(89, '2025-08-09', '12:00:00', '13:00:00', '2134334332', 'Couple', 4),
(90, '2025-08-10', '08:00:00', '09:00:00', '213417292', 'Group', 5),
(91, '2025-08-10', '09:00:00', '10:00:00', '21345689', 'Single', 6),
(92, '2025-08-11', '11:00:00', '12:00:00', '2134334332', 'Couple', 7),
(93, '2025-08-11', '13:00:00', '14:00:00', '213417292', 'Group', 1),
(94, '2025-08-12', '15:00:00', '16:00:00', '21345689', 'Single', 2),
(95, '2025-08-12', '17:00:00', '18:00:00', '2134334332', 'Group', 3),
(96, '2025-09-01', '08:00:00', '09:00:00', '213417292', 'Group', 1),
(97, '2025-09-01', '10:00:00', '11:00:00', '2134334332', 'Couple', 2),
(98, '2025-09-02', '09:00:00', '10:00:00', '21345689', 'Single', 3),
(99, '2025-09-02', '12:00:00', '13:00:00', '213417292', 'Group', 4),
(100, '2025-09-03', '11:00:00', '12:00:00', '2134334332', 'Group', 5),
(101, '2025-09-03', '13:00:00', '14:00:00', '21345689', 'Single', 6),
(102, '2025-09-04', '15:00:00', '16:00:00', '213417292', 'Couple', 7),
(103, '2025-09-04', '16:00:00', '17:00:00', '2134334332', 'Group', 1),
(104, '2025-09-05', '08:00:00', '09:00:00', '21345689', 'Single', 2),
(105, '2025-09-05', '10:00:00', '11:00:00', '213417292', 'Group', 3),
(106, '2025-09-06', '12:00:00', '13:00:00', '2134334332', 'Couple', 4),
(107, '2025-09-06', '14:00:00', '15:00:00', '21345689', 'Group', 5),
(108, '2025-09-07', '16:00:00', '17:00:00', '213417292', 'Single', 6),
(109, '2025-09-07', '17:00:00', '18:00:00', '2134334332', 'Group', 7),
(110, '2025-09-08', '08:00:00', '09:00:00', '21345689', 'Couple', 1),
(111, '2025-09-08', '09:00:00', '10:00:00', '213417292', 'Single', 2),
(112, '2025-09-09', '10:00:00', '11:00:00', '2134334332', 'Group', 3),
(113, '2025-09-09', '13:00:00', '14:00:00', '21345689', 'Single', 4),
(114, '2025-09-10', '12:00:00', '13:00:00', '213417292', 'Couple', 5),
(115, '2025-09-10', '14:00:00', '15:00:00', '2134334332', 'Group', 6),
(116, '2025-09-11', '16:00:00', '17:00:00', '21345689', 'Single', 7),
(117, '2025-09-12', '08:00:00', '09:00:00', '213417292', 'Group', 1),
(118, '2025-09-13', '09:00:00', '10:00:00', '2134334332', 'Couple', 2),
(119, '2025-09-14', '11:00:00', '12:00:00', '21345689', 'Group', 3),
(120, '2025-09-15', '13:00:00', '14:00:00', '213417292', 'Single', 4),
(121, '2025-09-16', '15:00:00', '16:00:00', '2134334332', 'Group', 5),
(122, '2025-09-17', '17:00:00', '18:00:00', '21345689', 'Couple', 6),
(123, '2025-09-18', '08:00:00', '09:00:00', '213417292', 'Single', 7),
(124, '2025-09-19', '09:00:00', '10:00:00', '2134334332', 'Group', 1),
(125, '2025-09-20', '10:00:00', '11:00:00', '21345689', 'Single', 2),
(126, '2025-08-31', '08:00:00', '09:00:00', '2134334332', 'Single', 1),
(127, '2025-08-14', '12:00:00', '13:00:00', '2134334332', 'Group', 3),
(128, '2025-08-15', '14:00:00', '15:00:00', '21345689', 'Group', 3),
(129, '2025-08-13', '13:00:00', '14:00:00', '2134334332', 'Group', 3);

-- --------------------------------------------------------

--
-- Table structure for table `exercise_types`
--

CREATE TABLE `exercise_types` (
  `ExerciseTypeID` int(11) NOT NULL,
  `TypeName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exercise_types`
--

INSERT INTO `exercise_types` (`ExerciseTypeID`, `TypeName`) VALUES
(7, 'אירובי'),
(2, 'חלק עליון'),
(3, 'חלק תחתון'),
(6, 'כוח'),
(1, 'כל הגוף'),
(5, 'ליבה'),
(4, 'רגליים');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `OrderID` int(11) NOT NULL,
  `UserID` varchar(20) DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `Status` enum('Pending','Accepted','Completed','Cancelled') DEFAULT 'Pending',
  `TotalPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`OrderID`, `UserID`, `OrderDate`, `Status`, `TotalPrice`) VALUES
(4, '242422', '2025-08-02', 'Completed', 299.00),
(5, '242422', '2025-08-02', 'Completed', 315.90),
(6, '242422', '2025-08-03', 'Accepted', 306.54),
(7, '0987654333', '2025-08-04', 'Cancelled', 613.08),
(8, '213417292', '2025-08-04', 'Accepted', 306.54),
(9, '242422', '2025-08-06', 'Accepted', 631.80),
(10, '213417292', '2025-08-11', 'Pending', 582.66);

-- --------------------------------------------------------

--
-- Table structure for table `order_products`
--

CREATE TABLE `order_products` (
  `OrderID` int(11) NOT NULL,
  `ProductCode` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_products`
--

INSERT INTO `order_products` (`OrderID`, `ProductCode`, `Quantity`) VALUES
(4, 2, 1),
(5, 12, 1),
(6, 19, 1),
(7, 19, 2),
(8, 19, 1),
(9, 6, 2),
(10, 1, 1),
(10, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_codes`
--

CREATE TABLE `password_reset_codes` (
  `Email` varchar(255) NOT NULL,
  `Code` varchar(10) NOT NULL,
  `ExpirationTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymenthistory`
--

CREATE TABLE `paymenthistory` (
  `PaymentID` int(11) NOT NULL,
  `UserID` varchar(20) DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `PaymentDate` date DEFAULT NULL,
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `PaymentID` int(11) NOT NULL,
  `UserID` varchar(20) DEFAULT NULL,
  `PaymentDate` datetime DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `TransactionID` varchar(100) DEFAULT NULL,
  `PaymentFor` enum('Order','Subscription') DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `Status` enum('Pending','Completed','Failed') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`PaymentID`, `UserID`, `PaymentDate`, `Amount`, `TransactionID`, `PaymentFor`, `ReferenceID`, `Status`) VALUES
(3, '242422', '2025-08-02 14:11:02', 299.00, NULL, 'Order', 4, 'Completed'),
(4, '242422', '2025-08-02 18:18:36', 315.90, NULL, 'Order', 5, 'Completed'),
(5, '242422', '2025-08-03 13:01:31', 306.54, NULL, 'Order', 6, 'Completed'),
(6, '0987654333', '2025-08-04 12:39:50', 613.08, NULL, 'Order', 7, 'Completed'),
(7, '213417292', '2025-08-04 15:08:46', 306.54, NULL, 'Order', 8, 'Completed'),
(8, '242422', '2025-08-06 17:12:55', 631.80, NULL, 'Order', 9, 'Completed'),
(9, '213417292', '2025-08-11 14:14:21', 582.66, NULL, 'Order', 10, 'Completed'),
(10, '347217394', '2025-08-12 17:32:01', 250.00, NULL, 'Subscription', 35449955, 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductCode` int(11) NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Descripetion` text DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `ImageURL` varchar(255) DEFAULT NULL,
  `Stock` int(11) DEFAULT NULL,
  `CategoryID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`ProductCode`, `Name`, `Type`, `Descripetion`, `Price`, `ImageURL`, `Stock`, `CategoryID`) VALUES
(1, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'אבקות חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 199.00, '1749756736271.webp', 17, 1),
(2, 'אבקת חלבון WHEY בטעם וניל', 'אבקות חלבון', 'הקלאסיקה האולטימטיבית! אבקת חלבון WHEY בטעם וניל מציעה 25 גרם חלבון איכותי ו-5.7 גרם BCAA בכל מנה, עם מרקם חלק וטעם וניל עשיר. מושלם להתאוששות לאחר אימון או כשמתחשק לכם שייק חלבון קרמי ומפנק!', 299.00, '1749756036586.webp', 31, 1),
(6, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'אבקות חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 270.00, '1749763697902.webp', 16, 1),
(12, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם שוקולד לבן ופיסטוק', '', 'מארז 18 חטיפי חלבון Allinpro, כל חטיף מספק 15 גרם חלבון איכותי. חטיף רך במיוחד, מצופה שוקולד לבן עם טעם פיסטוק עשיר ושכבת קרם מפנקת. מושלם לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי להתפשר על התזונה.', 270.00, '1750875043362.webp', 11, 3),
(13, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם עוגת גבינה פטל', NULL, 'חטיף חלבון רך במיוחד, בתוספת שכבת קרם למרקם מפנק.  מכיל 15 גרם חלבון, 2.4 גרם BCAA, ורק 2.1 גרם סוכר – אידיאלי לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי לפגוע בתזונה.  הבחירה המושלמת לספורטאים ולכל מי שמחפש חטיף עשיר בחלבון עם טעם ממכר!', 270.00, '1750875226145.webp', 14, 3),
(15, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'חטיפי חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 270.00, '1751128886053.webp', 15, 3),
(16, 'מארז משקה מי חלבון בטעם אפרסק – 12 יחידות', 'משקאות חלבון', 'משקה מי חלבון – הדרך הקלילה והמרעננת לצרוך חלבון! מכיל חלבון מי גבינה איזולאט, 20 גרם חלבון ורק 85 קלוריות בבקבוק. פתרון אידיאלי למי שלא מתחבר לשייקים מסורתיים!', 192.00, '1751129164321.webp', 6, 2),
(17, 'מארז משקה אנרגיה ALLIN INERGY בטעם פירות יער – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130740146.webp', 14, 4),
(18, 'מארז משקה אנרגיה ALLIN INERGY בטעם הדרים ליים – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130829673.webp', 15, 4),
(19, 'מארז משקה אנרגיה ALLIN INERGY בטעם טרופי – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130872617.webp', 11, 4),
(20, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם שוקולד לבן בוטנים קרמל', 'חטיפי חלבון', 'חטיף חלבון רך במיוחד, מצופה שוקולד לבן עשיר עם שבבי בוטנים, בתוספת שכבת קרם למרקם מפנק. מכיל 15 גרם חלבון, 2.4 גרם BCAA, ורק 2.1 גרם סוכר – אידיאלי לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי לפגוע בתזונה. הבחירה המושלמת לספורטאים ולכל מי שמחפש חטיף עשיר בחלבון עם טעם ממכר!', 270.00, '1754913519008.webp', 17, 3),
(21, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם שוקולד חלב קרמל', 'חטיפי חלבון', 'חטיף חלבון רך במיוחד, מצופה שוקולד חלב עשיר עם טעם קרמל מענג, בתוספת שכבת קרם למרקם מושלם. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.1 גרם סוכר – הבחירה האידיאלית לאחר אימון, בין הארוחות או כשמתחשק משהו מתוק ומזין מבלי לפגוע בשגרת התזונה. מושלם לאוהבי השוקולד והקרמל שרוצים ליהנות מכל ביס!', 270.00, '1754913552559.webp', 14, 3),
(22, 'מארז 24 חטיפי חלבון EXTRA CREAM בטעם שוקולד לבן עוגיות', 'חטיפי חלבון', 'חטיף אחד, ארבע סיבות להתפנק! EXTRA CREAM בטעם שוקולד לבן עוגיות מצופה בשוקולד לבן עשיר, עם פצפוצים קראנצ\'יים, שכבת קרם מפנקת ושבבי עוגיות שמוסיפים לכל ביס טעם מושלם. המרקם שמשלב רכות ופריכות הופך כל הפסקה לרגע הכי מתוק ביום. מכיל 17.5 גרם חלבון, 2.8 גרם BCAA, ורק 2.1 גרם סוכר – אידיאלי לאחר אימון, בין הארוחות או כשמתחשק משהו מתוק שלא פוגע בתזונה!', 360.00, '1754913623399.webp', 17, 3),
(23, 'מארז 24 חטיפי חלבון EXTRA CREAM בטעם בננה טופי', 'חטיפי חלבון', 'חטיף אחד – ארבע סיבות להתפנק! חטיף EXTRA CREAM בטעם בננה טופי משלב ציפוי שוקולד לבן, מרקם רך וטעם שוקולדי עשיר, שהופך כל הפסקה לרגע הכי טוב ביום. מכיל 18 גרם חלבון, 2.8 גרם BCAA, ורק 2.2 גרם סוכר – פתרון מושלם למי שמחפש פינוק חלבוני איכותי אחרי אימון, בין ארוחות או פשוט כשמתחשק משהו מתוק ומזין.', 360.00, '1754913666198.webp', 19, 3),
(24, 'מארז 12 חטיפי חלבון בטעם שוקולד צ\'יפ (100 גרם ליחידה)', 'חטיפי חלבון', 'חטיף חלבון גדול ועשיר בטעם שוקולד צ\'יפ – שילוב של שכבת קרם ושכבת קראנצ\' מפנקת עם 38 גרם חלבון! מכיל תערובת חלבונים איכותית, 6.1 גרם BCAA, ויטמינים ומינרלים, ורק 2.2 גרם סוכר.', 216.00, '1754913699495.webp', 19, 3),
(25, 'מארז 12 חטיפי חלבון בטעם שוקולד פאדג\' (100 גרם ליחידה)', 'חטיפי חלבון', 'חטיף חלבון גדול ועשיר בטעם שוקולד פאדג\' – שילוב של שכבת קרם ושכבת קראנצ\' מפנקת עם 36.5 גרם חלבון! מכיל תערובת חלבונים איכותית, BCAA, ויטמינים ומינרלים.', 216.00, '1754913742047.webp', 17, 3),
(26, 'מארז 12 עוגיות חלבון בטעם דאבל שוקולד', 'חטיפי חלבון', 'עוגיית חלבון בטעם דאבל שוקולד – שילוב מושלם של טעם שוקולדי עשיר ומרקם מפנק. מושלם כנשנוש בין ארוחות, לפני אימון או סתם כשמתחשק משהו טעים ומזין.', 179.00, '1754913783099.webp', 20, 3),
(27, 'אבקת חלבון WHEY בטעם קרם עוגיות – משקל 2.013 ק\"ג (61 מנות)', 'אבקות חלבון', 'לכל חובבי העוגיות! אבקת חלבון WHEY בטעם קרם עוגיות מספקת 25 גרם חלבון איכותי ו-5.7 גרם BCAA בכל מנה, עם מרקם קטיפתי וטעם מתוק שמתאים לכל שייק חלבון! מושלמת לאימון, להתאוששות ולשדרוג הארוחה החלבונית שלך.', 299.00, '1754913875389.webp', 16, 1),
(28, 'אבקת חלבון WHEY ללא תוספת טעם – משקל 759 גרם (23 מנות)', 'אבקות חלבון', 'הכי טבעי שיש!  אבקת חלבון WHEY ללא תוספת טעם – החלבון הטהור ללא תוספות, צבעים או ממתיקים. מכילה 26 גרם חלבון איכותי ו-5.8 גרם BCAA בכל מנה, עם ערך ביולוגי גבוה וספיגה מהירה. אידיאלית לשימוש בשייקים מותאמים אישית, בבישול ובאפייה לחיזוק תזונתי!', 149.00, '1754913926914.webp', 10, 1),
(29, 'אבקת חלבון WHEY בטעם אייס קפה – משקל 759 גרם (23 מנות)', 'אבקות חלבון', 'כל היתרונות של WHEY בטעם אייס קפה – עכשיו באריזה קומפקטית! מכילה 23 מנות חלבון איכותי, כל אחת עם 25 גרם חלבון ו-5.7 גרם BCAA. אידיאלית למי שרוצה תמיכה בהתאוששות ושייק עשיר בטעם קפה קר!', 149.00, '1754913953981.webp', 28, 1),
(30, 'אבקת חלבון WHEY בטעם שוקולד בלגי – משקל 759 גרם (23 מנות)', 'אבקות חלבון', 'כל הטעם העשיר של שוקולד בלגי איכותי, עכשיו באריזה קומפקטית! מכילה 23 מנות חלבון איכותי, כל אחת עם 24 גרם חלבון ו-5.3 גרם BCAA. מושלם לשייקים מפנקים לאחר אימון או לשדרוג ארוחה חלבונית.', 149.00, '1754914011481.webp', 26, 1),
(31, 'אבקת חלבון WHEY בטעם פיסטוק – משקל 2.013 ק\"ג (61 מנות)', 'אבקות חלבון', 'אבקת חלבון WHEY בטעם פיסטוק אריזה גדולה  אבקת חלבון WHEY בטעם פיסטוק מספקת 26 גרם חלבון איכותי ו-5.8 גרם BCAA בכל מנה, עם מרקם קרמי וטעם עשיר שמתמזג מושלם עם שייקים ותוספות. אידיאלי להתאוששות מהירה לאחר אימון או להוספת מתיקות עדינה לשייק היומי שלך!', 299.00, '1754914043777.webp', 19, 1),
(32, 'אבקת חלבון WHEY בטעם בננה – משקל 759 גרם (23 מנות)', 'אבקות חלבון', 'אותו טעם בננה עשיר ומרקם קטיפתי – עכשיו באריזה קומפקטית! מכילה 23 מנות חלבון איכותי, כל אחת עם 26 גרם חלבון ו-5.8 גרם BCAA. אידיאלית לשייקים מרעננים ולשיפור ההתאוששות אחרי אימון!', 149.00, '1754914088377.webp', 18, 1),
(33, 'אבקת חלבון WHEY בטעם שוקולד לבן – משקל 2.013 ק\"ג (61 מנות)', 'אבקות חלבון', 'לחובבי השוקולד הלבן! אבקת חלבון WHEY בטעם שוקולד לבן מספקת 26 גרם חלבון איכותי ו-5.8 גרם BCAA בכל מנה, עם מרקם קרמי וטעם עשיר שמתמזג מושלם עם שייקים ותוספות. אידיאלי להתאוששות מהירה לאחר אימון או להוספת מתיקות עדינה לשייק היומי שלך!', 299.00, '1754914172364.webp', 16, 1),
(34, 'אבקת קריאטין - 240 גרם (80 מנות)', 'תוספי תזונה', 'למקסם את הביצועים שלכם! אבקת קריאטין איכותית המבוססת על חומר הגלם Creapure®, הידוע בטוהרו ובאיכותו. קריאטין הוא רכיב תזונתי שעשוי לשפר את קצב ייצור האנרגיה, במיוחד באימונים בעצימות גבוהה ולסייע להתאוששות לאחריהם.', 109.00, '1754914533966.webp', 16, 5),
(35, 'Magnox Sport Plus', 'תוספי תזונה', 'מגנוקס - אבץ וויטמינים לספורטאים!  תוסף מזון שפותח במיוחד עבור הספורטאים ומיועד לשפר את הכושר גופני היכולת והביצועים, תוך מניעת עייפות התכווצויות שרירים.  במהלך ואחרי האימון, כמו גם קידום התאוששות מהירה לאחר האימון.  מגנוקס ספורט פלוס, מבוסס על מולקולת מגנוקס המוגנת בפטנט, שיעילותה הוכחה כטובה ביותר בספיגה תוך תאית במחקר קליני השוואתי ופורץ דרך.  מגנוקס ספורט פלוס נספג לתאי הגוף במהירות ויעילות כמעט פי 3 יותר ממגנזיום ציטראט.  מגנוקס ספורט פלוס משפיע באופן מידי על שיפור הכושר והיכולת.  ביכולתו למנוע התכווצויות שרירים ולשפר את התאוששות הגוף לאחר מאמץ פיזי.  מגנוקס ספורט פלוס משפיע מיד בתוך השימוש הראשון ומתאים לכל סוג של ספורטאים חובבים או תחרותיים.  מגנזיום הינו מינרל בסיסי המשמש חומר מזין חיוני לגוף. מגנזיום מעורב בתהליכים פיזיולוגיים חשובים רבים, כולל ייצור אנרגיה, התכווצות שרירים, הרפיית שרירים ושמירה על בריאות תאי הגוף. מגנזיום משחק תפקיד מרכזי בייצור אנרגיה תאית.  הימצאות מגנזיום חיונית להפקת אנרגיה מה- ATP .  ככל שיש יותר מגנזיום בגוף, יכולת הגוף לייצר אנרגיה מתעצמת.', 89.00, '1754914579039.webp', 29, 5),
(36, 'Magnox B6', 'תוספי תזונה', 'Magnox B6™ כמוסות מגנזיום בתוספת ויטמינים  התכשיר היחיד שמכיל מגנזיום פטנטי בעל ספיגה מוכחת לתאים  בתוספת סינרגטית של B6 ביחס של 1:10 שמאפשר ספיגה תוך תאית  אופטימאלית גם אנשים בלחץ ובכך לאפשר הקלה במצבי לחץ.  היחיד שמכיל מגנזיום פטנטי, המאפשר חדירה אופטימאלית מוכחת במחקר מבוקר לתאים.  מכיל בנוסף ויטמין B6 בריכוז גבוה )ביחס של 1:10 מגנזיום: ויטמין B6 ( המאפשר פעילות למניעת לחץ.  מכיל ויטמין D להגברת ספיגת המגנזיום.  השילוב הוכח כמסייע בשמירה על תפקוד תקין של מערכת העצבים והקלה משמעותית במצבי לחץ.', 80.00, '1754914610822.webp', 28, 5),
(37, 'אבקת קדם אימון בטעם תות לימונדה - 240 גרם (20 מנות)', 'תוספי תזונה', 'רוצים למקסם את האימון שלכם? אבקת קדם האימון מספקת 200 מ\"ג קפאין למנה, לצד שילוב עוצמתי של קריאטין, ארגינין ובטא-אלנין, שתומכים בביצועים מיטביים, ריכוז מרבי ופרץ אנרגיה מתמשך לכל אימון.', 129.00, '1754914652539.webp', 21, 5),
(38, 'אבקה איזוטונית בטעם ענבים - 700 גרם (20 מנות)', 'תוספי תזונה', 'אבקה איזוטונית המכילה שילוב מדויק של מלחים, פחמימות וסוכרים, המסייעת בשמירה על רמות אנרגיה, איזון נוזלים והתאוששות מהירה במהלך פעילות גופנית ולאחריה. מועשרת במגנזיום, סידן ואשלגן לתמיכה אופטימלית בביצועים.', 89.00, '1754914681171.webp', 18, 5),
(39, 'מארז ג\'ל אנרגיה בטעם פירות יער -24 יחידות', 'ג\'ל אנרגיה', 'מספק תמיכה מיידית באנרגיה עם שילוב של מלטודקסטרין ופרוקטוז לאספקת פחמימות זמינות, נתרן לאיזון הנוזלים בגוף ותוספת ויטמינים וחומצות אמינו (BCAA) לתמיכה במאמץ ממושך. ללא קפאין – מתאים לכל פעילות גופנית! 🚴‍♂️🔥', 168.00, '1754914787914.webp', 20, 6),
(40, 'מארז ג\'ל אנרגיה בטעם אספרסו – 24 יחידות', 'ג\'ל אנרגיה', 'ג\'ל אנרגיה בטעם אספרסו – טעימה מרוכזת של אנרגיה עם קפאין! מספק דחיפה מהירה עם שילוב של מלטודקסטרין ופרוקטוז, המסייעים באספקת אנרגיה זמינה לתאי הגוף, יחד עם נתרן לאיזון הנוזלים ותוספת BCAA, ויטמין C וויטמין E. מכיל קפאין – אידיאלי לאימונים עצימים ולמקסימום ריכוז!', 168.00, '1754914833134.webp', 17, 6),
(41, 'מארז ג\'ל אנרגיה בטעם קרמל מלוח – 24 יחידות', 'ג\'ל אנרגיה', 'ג\'ל אנרגיה בטעם קרמל מלוח – איזון מושלם של מתוק ומלוח עם אנרגיה מתפרצת! מספק תדלוק מיידי עם שילוב של מלטודקסטרין ופרוקטוז, המסייעים באספקת אנרגיה יציבה, יחד עם נתרן מוגבר (128 מ\"ג למנה) לאיזון הנוזלים וBCAA, ויטמין A, ויטמין C וקפאין. אידיאלי לאימונים עצימים ולמקסימום ריכוז!', 168.00, '1754914857194.webp', 16, 6);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `ProgressID` int(11) NOT NULL,
  `TraineeID` varchar(20) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `Weight` float DEFAULT NULL,
  `Height` float DEFAULT NULL,
  `Notes` text DEFAULT NULL,
  `CoachID` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `Key` varchar(50) NOT NULL,
  `Value` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`Key`, `Value`) VALUES
('vat_percent', '17.6');

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `SubscriptionID` int(11) NOT NULL,
  `UserID` varchar(20) DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `Type` enum('Monthly','Yearly') DEFAULT NULL,
  `TotalAmount` decimal(10,2) DEFAULT NULL,
  `MembershipType` enum('Group','Couple','Single') DEFAULT 'Group',
  `CardHolder` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`SubscriptionID`, `UserID`, `StartDate`, `EndDate`, `Type`, `TotalAmount`, `MembershipType`, `CardHolder`) VALUES
(6, '242422', '2025-08-04', '2025-09-04', 'Monthly', 292.50, 'Group', 'Ariam Rahal'),
(7, '123456788', '2025-08-04', '2026-08-04', 'Yearly', 7020.00, 'Single', 'Yaman Zeed'),
(8, '0987654333', '2025-07-14', '2025-08-14', 'Monthly', 4914.00, 'Couple', 'Ayan Rahal'),
(9, '12345678', '2025-08-08', '2025-09-08', 'Monthly', 292.50, 'Group', 'Ayman Zed'),
(11, '362837103', '2025-08-08', '2025-09-08', 'Monthly', 292.50, 'Group', 'rahaf mostafa'),
(12, '2132182735', '2025-08-08', '2026-08-08', 'Yearly', 4212.00, 'Group', 'aya ameer'),
(13, '41272862', '2025-08-08', '2025-09-08', 'Monthly', 409.50, 'Couple', 'dana hassoun'),
(14, '324762312', '2025-08-08', '2025-09-08', 'Monthly', 409.50, 'Couple', 'layan droubie'),
(15, '347217394', '2025-08-12', '2025-09-12', 'Monthly', 294.00, 'Group', 'PayPalSandbox');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` varchar(20) NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Role` enum('Coach','Trainee','Admin') DEFAULT NULL,
  `ImageURL` varchar(255) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `SocialLinks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Name`, `Phone`, `Email`, `Password`, `Role`, `ImageURL`, `Description`, `SocialLinks`) VALUES
('0987654333', 'איאו רחאל', '0503045072', 'ayan.rahal@gmail.com', '$2b$10$3CthWTLD3KV/8..2ZwKc8Ouoi/CLqeDvq3j/Eq.z0Hm9xTNMgjW8q', 'Trainee', '1754300427243.jpg', NULL, NULL),
('12345678', 'ayman', '050-3045074', 'ayman@gmail.com', '$2b$10$xfhUV5RxtIzEXPjhnu7wROo6OWugfsCPB98/tknUUWyqAQFTCYf8S', 'Trainee', '1750519643153.jpg', NULL, NULL),
('123456788', 'Yaman Zeed', '0504927282', 'Yaman.Zeed@gmail.com', '$2b$10$0rgT81jp06xQciXf7/T7PeZ9I6qNNdVmLpI4LalDfjLGyjwyVRqXm', 'Trainee', NULL, NULL, NULL),
('2132182735', 'aya amer', '052374644', 'aya.amer@email.com', '$2b$10$gbXGPCqKZAR1b1qYcs6gbudKVMv0q7R.DCwdv1H37mtqQ1..uB.j.', 'Trainee', NULL, NULL, NULL),
('213417292', 'אימאן זייד', '0502874442', 'ayman.zeed@gmail.com', '$2b$10$Ftz.NqJYMooUlz4wuvwJxuqaAz7/tCTSdhG7vypi6gBEYzaArXDgG', 'Coach', '1750777078067.jpg', NULL, NULL),
('2134334332', 'Yasmen', '0523334446', 'yasmen@gmail.com', '$2b$10$kF9Mm7ZzvwfFLVX2FBlhmOuW/mYWusPLCL74KJeaaDQTzlWwgzJEi', 'Coach', '1751477964738.jpg', NULL, NULL),
('21345689', 'סופי', '0523334446', 'sofi12@gmail.com', '$2b$10$yT0fPiKsZ3sccG32Uh2yiu5tc3CaG7lrGe6hArJWhL/8GI9TrsP56', 'Coach', '1750775759121.jpg', NULL, NULL),
('213481963', 'arwad rahal', '0503982223', 'arwad.rahal1@gmail.com', '$2b$10$zeorQYjQ4QL4EHeQRleF.OZGjn4mQyMVQox8FDC9X/kY5sAd9uLc2', 'Admin', '1750592229875.jpg', 'מנהלת ומפתחת פלטפורמת FitTrack, דואגת שכל מתאמנת תמצא את הדרך הנכונה עבורה להצלחה והתמדה. מאמינה בשילוב של מקצועיות, יחס אישי והשראה יומיומית.', 'https://www.instagram.com/kayla_itsines/'),
('242422', 'Ariam Rahal', '0503982224', 'Ariam.rahal@gmail.com', '$2b$10$jWkPLoQxCM60HTDy7Er3k.Xz8C0I0HJ7gVMPQOmeO.yZPu8gWXbma', 'Trainee', '1750776999772.jpg', 'מתאמנת ב־FitTrack, אוהבת את הדרך המאתגרת והמעצימה אל בריאות טובה יותר. תמיד שואפת ללמוד, להתחזק ולהתמיד – כי הדרך חשובה לא פחות מהתוצאה.', NULL),
('324762312', 'layan droubi', '053475826', 'layan.droubi@email.com', '$2b$10$..tST1FV1MWElzWnDmHrCeCCoq3ZarQ1lgm0Shp4Sl5tUWd3H0.t2', 'Trainee', NULL, NULL, NULL),
('347217394', 'sama jaber', '0502676373', 'sama.jaber@email.com', '$2b$10$.nlvy2O0A5aZ1472CZO2deRA4KAd0k57irlyfAZqhpvmq76meBLQO', 'Trainee', '1754654881799.jpg', NULL, NULL),
('362837103', 'rahaf mostafa', '0501925534', 'rahaf.mostafa@email.com', '$2b$10$NC1bp//EswtoQoFST2g7JeE/kiql1Xgj21sQl0dsAFVoa1VD.MllW', 'Trainee', NULL, NULL, NULL),
('41272862', 'dana hassoun', '0503274644', 'dana.hassoun@email.com', '$2b$10$hB3e1XoNo4mEH1QqbeuGo.URQp/8Pn7BFcMCvFgUYgyAx9m63ZLay', 'Trainee', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`CategoryID`);

--
-- Indexes for table `exerciseparticipants`
--
ALTER TABLE `exerciseparticipants`
  ADD PRIMARY KEY (`ExerciseID`,`TraineeID`),
  ADD KEY `TraineeID` (`TraineeID`);

--
-- Indexes for table `exercises`
--
ALTER TABLE `exercises`
  ADD PRIMARY KEY (`ExerciseID`),
  ADD KEY `CoachID` (`CoachID`),
  ADD KEY `fk_exercises_type` (`ExerciseTypeID`);

--
-- Indexes for table `exercise_types`
--
ALTER TABLE `exercise_types`
  ADD PRIMARY KEY (`ExerciseTypeID`),
  ADD UNIQUE KEY `TypeName` (`TypeName`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `order_products`
--
ALTER TABLE `order_products`
  ADD PRIMARY KEY (`OrderID`,`ProductCode`),
  ADD KEY `ProductCode` (`ProductCode`);

--
-- Indexes for table `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD PRIMARY KEY (`Email`);

--
-- Indexes for table `paymenthistory`
--
ALTER TABLE `paymenthistory`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductCode`),
  ADD KEY `fk_products_category` (`CategoryID`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`ProgressID`),
  ADD KEY `TraineeID` (`TraineeID`),
  ADD KEY `CoachID` (`CoachID`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`Key`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`SubscriptionID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `ExerciseID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `exercise_types`
--
ALTER TABLE `exercise_types`
  MODIFY `ExerciseTypeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `paymenthistory`
--
ALTER TABLE `paymenthistory`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductCode` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `ProgressID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `SubscriptionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exerciseparticipants`
--
ALTER TABLE `exerciseparticipants`
  ADD CONSTRAINT `exerciseparticipants_ibfk_1` FOREIGN KEY (`ExerciseID`) REFERENCES `exercises` (`ExerciseID`),
  ADD CONSTRAINT `exerciseparticipants_ibfk_2` FOREIGN KEY (`TraineeID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `exercises`
--
ALTER TABLE `exercises`
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`CoachID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `fk_exercises_type` FOREIGN KEY (`ExerciseTypeID`) REFERENCES `exercise_types` (`ExerciseTypeID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `order_products`
--
ALTER TABLE `order_products`
  ADD CONSTRAINT `order_products_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`);

--
-- Constraints for table `paymenthistory`
--
ALTER TABLE `paymenthistory`
  ADD CONSTRAINT `paymenthistory_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`TraineeID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`CoachID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `subscription_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
