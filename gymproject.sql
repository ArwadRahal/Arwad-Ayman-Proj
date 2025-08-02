-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2025 at 08:42 PM
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
(4, 'אולאין אינרג\'י', '1751130658231.png');

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
(31, '242422');

-- --------------------------------------------------------

--
-- Table structure for table `exercises`
--

CREATE TABLE `exercises` (
  `ExerciseID` int(11) NOT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `StartTime` time DEFAULT NULL,
  `EndTime` time DEFAULT NULL,
  `CoachID` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exercises`
--

INSERT INTO `exercises` (`ExerciseID`, `Type`, `Date`, `StartTime`, `EndTime`, `CoachID`) VALUES
(26, 'כוח', '2025-06-11', '12:00:00', '13:00:00', '213417292'),
(27, 'כוח', '2025-06-26', '12:00:00', '13:00:00', '213417292'),
(29, 'כוח', '2025-06-18', '12:00:00', '13:00:00', '213417292'),
(30, 'רגליים', '2025-06-28', '12:00:00', '13:00:00', '213417292'),
(31, 'רגליים', '2025-06-28', '13:00:00', '14:00:00', '21345689');

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
(3, '242422', '2025-07-25', 'Cancelled', 270.00),
(4, '242422', '2025-08-02', 'Accepted', 299.00),
(5, '242422', '2025-08-02', 'Completed', 315.90);

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
(3, 13, 1),
(4, 2, 1),
(5, 12, 1);

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
(4, '242422', '2025-08-02 18:18:36', 315.90, NULL, 'Order', 5, 'Completed');

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
  `CategoryID` int(11) DEFAULT NULL,
  `IsArchived` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`ProductCode`, `Name`, `Type`, `Descripetion`, `Price`, `ImageURL`, `Stock`, `CategoryID`, `IsArchived`) VALUES
(1, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'אבקות חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 199.00, '1749756736271.webp', 6, 1, 0),
(2, 'אבקת חלבון WHEY בטעם וניל', 'אבקות חלבון', 'הקלאסיקה האולטימטיבית! אבקת חלבון WHEY בטעם וניל מציעה 25 גרם חלבון איכותי ו-5.7 גרם BCAA בכל מנה, עם מרקם חלק וטעם וניל עשיר. מושלם להתאוששות לאחר אימון או כשמתחשק לכם שייק חלבון קרמי ומפנק!', 299.00, '1749756036586.webp', 44, 1, 0),
(5, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'חטיפי חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 270.00, '1749763653573.webp', 12, 3, 0),
(6, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'אבקות חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 270.00, '1749763697902.webp', 15, 1, 0),
(12, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם שוקולד לבן ופיסטוק', '', 'מארז 18 חטיפי חלבון Allinpro, כל חטיף מספק 15 גרם חלבון איכותי. חטיף רך במיוחד, מצופה שוקולד לבן עם טעם פיסטוק עשיר ושכבת קרם מפנקת. מושלם לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי להתפשר על התזונה.', 270.00, '1750875043362.webp', 11, 3, 0),
(13, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם עוגת גבינה פטל', NULL, 'חטיף חלבון רך במיוחד, בתוספת שכבת קרם למרקם מפנק.  מכיל 15 גרם חלבון, 2.4 גרם BCAA, ורק 2.1 גרם סוכר – אידיאלי לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי לפגוע בתזונה.  הבחירה המושלמת לספורטאים ולכל מי שמחפש חטיף עשיר בחלבון עם טעם ממכר!', 270.00, '1750875226145.webp', 14, 3, 0),
(15, 'מארז 18 חטיפי חלבון EXTRA SOFT בטעם קרם עוגיות', 'חטיפי חלבון', 'חטיף חלבון רך במיוחד עם מרקם מפנק, מצופה בשוקולד עשיר ובעל שכבת קרם בטעם קרם עוגיות. מכיל 15 גרם חלבון, 2.5 גרם BCAA, ורק 2.2 גרם סוכר – אידיאלי לשמירה על תזונה מאוזנת, חיטוב ובניית שריר. החטיף המושלם לאחר אימון, בין ארוחות או כשמתחשק משהו מתוק ומזין!', 270.00, '1751128886053.webp', 15, 3, 0),
(16, 'מארז משקה מי חלבון בטעם אפרסק – 12 יחידות', 'משקאות חלבון', 'משקה מי חלבון – הדרך הקלילה והמרעננת לצרוך חלבון! מכיל חלבון מי גבינה איזולאט, 20 גרם חלבון ורק 85 קלוריות בבקבוק. פתרון אידיאלי למי שלא מתחבר לשייקים מסורתיים!', 192.00, '1751129164321.webp', 36, 2, 0),
(17, 'מארז משקה אנרגיה ALLIN INERGY בטעם פירות יער – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130740146.webp', 14, 4, 0),
(18, 'מארז משקה אנרגיה ALLIN INERGY בטעם הדרים ליים – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130829673.webp', 15, 4, 1),
(19, 'מארז משקה אנרגיה ALLIN INERGY בטעם טרופי – 24 יחידות', 'אולאין אינרג\'י', 'ALLIN INERGY – משקה פונקציונלי מוגז עם קפאין ממקור טבעי, חומצות אמינו מסועפות (BCAA) וויטמינים. ללא סוכר – אידיאלי לרענון והתחדשות במהלך היום או לפני אימון!', 262.00, '1751130872617.webp', 15, 4, 0);

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
('vat_percent', '17');

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
  `TotalAmount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`SubscriptionID`, `UserID`, `StartDate`, `EndDate`, `Type`, `TotalAmount`) VALUES
(2, '242422', '2025-07-24', '2025-08-24', 'Monthly', 70.00),
(3, '12345678', '2025-07-24', '2026-07-24', 'Yearly', 700.00);

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
('12345678', 'ayman', '050-3045074', 'ayman@gmail.com', '$2b$10$xfhUV5RxtIzEXPjhnu7wROo6OWugfsCPB98/tknUUWyqAQFTCYf8S', 'Trainee', '1750519643153.jpg', NULL, NULL),
('213417292', 'אימאן זייד', NULL, 'ayman.zeed@gmail.com', '$2b$10$Ftz.NqJYMooUlz4wuvwJxuqaAz7/tCTSdhG7vypi6gBEYzaArXDgG', 'Coach', '1750777078067.jpg', NULL, NULL),
('2134334332', 'Yasmen', '0523334446', 'yasmen@gmail.com', '$2b$10$kF9Mm7ZzvwfFLVX2FBlhmOuW/mYWusPLCL74KJeaaDQTzlWwgzJEi', 'Coach', '1751477964738.jpg', NULL, NULL),
('21345689', 'סופי', '0523334446', 'sofi12@gmail.com', '$2b$10$yT0fPiKsZ3sccG32Uh2yiu5tc3CaG7lrGe6hArJWhL/8GI9TrsP56', 'Coach', '1750775759121.jpg', NULL, NULL),
('213481963', 'arwad rahal', '0503982223', 'arwad.rahal1@gmail.com', '$2b$10$chEUUHkF04sg9xi0cTVCBuw0IPSQemqWrMgNs9lsQiqgB.bvQ23we', 'Admin', '1750592229875.jpg', 'מנהלת ומפתחת פלטפורמת FitTrack, דואגת שכל מתאמנת תמצא את הדרך הנכונה עבורה להצלחה והתמדה. מאמינה בשילוב של מקצועיות, יחס אישי והשראה יומיומית.', 'https://www.instagram.com/kayla_itsines/'),
('242422', 'Ariam Rahal', '0503982224', 'Ariam.rahal@gmail.com', '$2b$10$jWkPLoQxCM60HTDy7Er3k.Xz8C0I0HJ7gVMPQOmeO.yZPu8gWXbma', 'Trainee', '1750776999772.jpg', 'מתאמנת ב־FitTrack, אוהבת את הדרך המאתגרת והמעצימה אל בריאות טובה יותר. תמיד שואפת ללמוד, להתחזק ולהתמיד – כי הדרך חשובה לא פחות מהתוצאה.', NULL);

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
  ADD KEY `CoachID` (`CoachID`);

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
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `ExerciseID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `paymenthistory`
--
ALTER TABLE `paymenthistory`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductCode` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `ProgressID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `SubscriptionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  ADD CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`CoachID`) REFERENCES `users` (`UserID`);

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
