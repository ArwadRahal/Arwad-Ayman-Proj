-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2025 at 02:29 PM
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
(3, 'חטיפי חלבון', '1749915400177.png');

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
(29, '242422');

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
(27, 'כוח', '2025-06-25', '12:00:00', '13:00:00', '213417292'),
(29, 'כוח', '2025-06-18', '12:00:00', '13:00:00', '213417292');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `OrderID` int(11) NOT NULL,
  `UserID` varchar(20) DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `Status` enum('Pending','Completed','Cancelled') DEFAULT NULL,
  `TotalPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_products`
--

CREATE TABLE `order_products` (
  `OrderID` int(11) NOT NULL,
  `ProductCode` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'מארז משקה מי חלבון בטעם פירות יער', 'אבקות חלבון', 'משקה מי חלבון – הדרך הקלילה והמרעננת לצרוך חלבון! מכיל חלבון מי גבינה איזולאט, 20 גרם חלבון ורק 79 קלוריות בבקבוק. פתרון אידיאלי למי שלא מתחבר לשייקים מסורתיים! (12 יחידו)', 192.00, '1749756736271.webp', 2, 1),
(2, 'אבקת חלבון WHEY בטעם וניל', 'אבקות חלבון', 'הקלאסיקה האולטימטיבית! אבקת חלבון WHEY בטעם וניל מציעה 25 גרם חלבון איכותי ו-5.7 גרם BCAA בכל מנה, עם מרקם חלק וטעם וניל עשיר. מושלם להתאוששות לאחר אימון או כשמתחשק לכם שייק חלבון קרמי ומפנק!', 299.00, '1749756036586.webp', 45, 1),
(3, 'אבקת חלבון WHEY בטעם פיסטוק', 'אבקות חלבון', 'אבקת חלבון WHEY בטעם פיסטוק אריזה גדולה', 299.00, '1749760087096.webp', 0, NULL),
(4, 'אבקת חלבון WHEY בטעם קרם עוגיות', 'אבקות חלבון', 'לכל חובבי העוגיות! אבקת חלבון WHEY בטעם קרם עוגיות מספקת 25 גרם חלבון איכותי ו-5.7 גרם BCAA בכל מנה, עם מרקם קטיפתי וטעם מתוק שמתאים לכל שייק חלבון! מושלמת לאימון, להתאוששות ולשדרוג הארוחה החלבונית שלך.', 299.00, '1749763605221.webp', 50, 1),
(5, 'אבקת חלבון WHEY בטעם בננה', 'אבקות חלבון', 'רעננות קיצית בכל לגימה! אבקת חלבון WHEY בטעם בננה מספקת 26 גרם חלבון איכותי ו-5.8 גרם BCAA בכל מנה, עם מרקם קטיפתי וטעם בננה עשיר. מושלם לשייקים קיציים, להתאוששות מהירה אחרי אימון או כתחליף חלבון טעים במהלך היום!', 299.00, '1749763653573.webp', 13, 1),
(6, 'אבקת חלבון WHEY בטעם שוקולד בלגי', 'אבקות חלבון', 'כל הטעם העשיר של שוקולד בלגי איכותי, עכשיו באריזה קומפקטית! מכילה 23 מנות חלבון איכותי, כל אחת עם 24 גרם חלבון ו-5.3 גרם BCAA. מושלם לשייקים מפנקים לאחר אימון או לשדרוג ארוחה חלבונית.', 149.00, '1749763697902.webp', 10, 1),
(7, 'אבקת חלבון WHEY ללא תוספת טעם', 'אבקות חלבון', 'הכי טבעי שיש!  אבקת חלבון WHEY ללא תוספת טעם – החלבון הטהור ללא תוספות, צבעים או ממתיקים. מכילה 26 גרם חלבון איכותי ו-5.8 גרם BCAA בכל מנה, עם ערך ביולוגי גבוה וספיגה מהירה. אידיאלית לשימוש בשייקים מותאמים אישית, בבישול ובאפייה לחיזוק תזונתי!', 149.00, '1749763741057.webp', 10, 1),
(8, 'מארז משקה מי חלבון בטעם פירות יער', 'משקאות חלבון', 'משקה מי חלבון – הדרך הקלילה והמרעננת לצרוך חלבון! מכיל חלבון מי גבינה איזולאט, 20 גרם חלבון ורק 79 קלוריות בבקבוק. פתרון אידיאלי למי שלא מתחבר לשייקים מסורתיים! (12 יחידו)', 192.00, '1749763898070.webp', 15, 2),
(9, 'מארז משקה מי חלבון בטעם אפרסק', 'משקאות חלבון', 'משקה מי חלבון – הדרך הקלילה והמרעננת לצרוך חלבון! מכיל חלבון מי גבינה איזולאט, 20 גרם חלבון ורק 85 קלוריות בבקבוק. פתרון אידיאלי למי שלא מתחבר לשייקים מסורתיים! ( 12 יחידות)', 192.00, '1749763944465.webp', 18, 2),
(10, 'אבקת חלבון WHEY בטעם שוקולד לבן ', 'אבקות חלבון', 'אותו טעם שוקולד לבן עשיר ומרקם חלק – עכשיו באריזה קומפקטית! מכילה 23 מנות חלבון איכותי, כל אחת עם 26 גרם חלבון ו-5.8 גרם BCAA. מושלם לשייקים מתוקים וקרמיים לאחר אימון או במהלך היום!', 149.00, '1749915227372.webp', 29, 2),
(11, 'EXTRA SOFT בטעם שוקולד לבן ופיסטוק', 'חטיפי חלבון', 'מארז 18 חטיפי חלבון Allinpro, כל חטיף מספק 15 גרם חלבון איכותי. חטיף רך במיוחד, מצופה שוקולד לבן עם טעם פיסטוק עשיר ושכבת קרם מפנקת. מושלם לאחר אימון, בין הארוחות או כשמתחשק משהו טעים ומזין מבלי להתפשר על התזונה.', 270.00, '1749915889124.webp', 17, 1);

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
('12345678', 'ayman', '+972 50-3045074', 'ayman@gmail.com', '$2b$10$xfhUV5RxtIzEXPjhnu7wROo6OWugfsCPB98/tknUUWyqAQFTCYf8S', 'Trainee', '1750519643153.jpg', NULL, NULL),
('213417292', 'אימאן זייד', NULL, 'ayman.zeed@gmail.com', '$2b$10$Ftz.NqJYMooUlz4wuvwJxuqaAz7/tCTSdhG7vypi6gBEYzaArXDgG', 'Coach', NULL, NULL, NULL),
('213481963', 'arwad rahal', '0503982223', 'arwad.rahal1@gmail.com', '$2b$10$SuxOa17Df7pjV2IebvYyc.66emvMPug0lhlTLuRNTo2jhjs.ICpQy', 'Admin', '1750592229875.jpg', 'מנהלת ומפתחת פלטפורמת FitTrack, דואגת שכל מתאמנת תמצא את הדרך הנכונה עבורה להצלחה והתמדה. מאמינה בשילוב של מקצועיות, יחס אישי והשראה יומיומית.', 'https://www.instagram.com/kayla_itsines/'),
('242422', 'Ariam Rahal', '0503982224', 'Ariam.rahal@gmail.com', '$2b$10$jWkPLoQxCM60HTDy7Er3k.Xz8C0I0HJ7gVMPQOmeO.yZPu8gWXbma', 'Trainee', '1750519542009.jpg', 'מתאמנת ב־FitTrack, אוהבת את הדרך המאתגרת והמעצימה אל בריאות טובה יותר. תמיד שואפת ללמוד, להתחזק ולהתמיד – כי הדרך חשובה לא פחות מהתוצאה.', NULL);

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
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exercises`
--
ALTER TABLE `exercises`
  MODIFY `ExerciseID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymenthistory`
--
ALTER TABLE `paymenthistory`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductCode` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `ProgressID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription`
--
ALTER TABLE `subscription`
  MODIFY `SubscriptionID` int(11) NOT NULL AUTO_INCREMENT;

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
