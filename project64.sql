-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 09, 2024 at 06:14 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project64`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `cus_id` varchar(10) NOT NULL,
  `f_id` varchar(10) NOT NULL,
  `price` double(10,2) NOT NULL,
  `qty` double(10,2) NOT NULL,
  `total` double(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `cus_id` varchar(10) NOT NULL,
  `cus_user` varchar(20) NOT NULL,
  `cus_pass` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `cus_email` varchar(50) NOT NULL,
  `cus_tel` varchar(10) NOT NULL,
  `cus_address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`cus_id`, `cus_user`, `cus_pass`, `name`, `cus_email`, `cus_tel`, `cus_address`) VALUES
('cus001', 'porapat574', 'paolo555', 'porapat duangkaew', 'popopow.660@gmail.com', '0801853053', '57/4 หมู่ 19 บ้านหนองโข่ย ต.ท่าพระ อ.เมือง จ.ขอนแก่น'),
('CUS002', 'ketwarin', '1234', 'เกษวริน ไกรษร', 'ketwarin@gmail.com', '012-345678', '123/12 อ.ภูเวียง จ.ขอนแก่น'),
('CUS003', 'manit', '01234', 'Manit santaweewat', 'manit@gmail.com', '080052255', '59/14 ต.ท่าพระ อ.เมือง จ.ขอนแก่น'),
('CUS004', 'user', '1234', 'user', 'user1@gmail.com', '0123451', '1');

-- --------------------------------------------------------

--
-- Table structure for table `fruit`
--

CREATE TABLE `fruit` (
  `f_id` varchar(10) NOT NULL,
  `f_name` varchar(50) NOT NULL,
  `f_img` varchar(255) NOT NULL,
  `buy_price` double(10,2) NOT NULL,
  `sale_price` double(10,2) NOT NULL,
  `balance` double(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `fruit`
--

INSERT INTO `fruit` (`f_id`, `f_name`, `f_img`, `buy_price`, `sale_price`, `balance`) VALUES
('F001', 'สละ', 'Salak-1.jpg', 40.00, 30.00, 1221.00),
('F002', 'ส้ม', 'Som.jpg', 35.00, 45.00, 200.00),
('F003', 'กล้วย', 'banana.jpg', 35.00, 40.00, 126.00),
('F004', 'แอปเปิ้ล', 'apple.jpg', 39.00, 49.00, 50.00),
('F005', 'ทุเรียนหมอนทอง', 'durain.jpg', 65.00, 80.00, 100.00),
('F006', 'ฝรั่งแป้นสีทอง', 'Guava.jpg', 27.00, 33.00, 99.00),
('F007', 'แตงโม', 'watermelon.jpg', 60.00, 75.00, 119.00),
('F008', 'แก้วมังกร', 'Dragon.jpg', 40.00, 45.00, 84.00),
('F009', 'สตรอวเบอรี่', 'straw.jpg', 44.00, 50.00, 48.00),
('F010', 'ฝรั่ง', 'Guava.jpg', 35.00, 40.00, 28.00),
('F011', 'แตงโมไร้เมล็ด', 'watermelon.jpg', 55.00, 60.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `or_id` varchar(10) NOT NULL,
  `cus_id` varchar(10) NOT NULL,
  `or_date` date NOT NULL DEFAULT current_timestamp(),
  `or_total` double(10,2) NOT NULL,
  `or_status` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`or_id`, `cus_id`, `or_date`, `or_total`, `or_status`) VALUES
('OR001', 'cus001', '2024-02-02', 45.00, '0'),
('OR002', 'cus001', '2024-02-06', 1350.00, '4'),
('OR003', 'cus001', '2024-02-16', 323.00, '2'),
('OR004', 'CUS002', '2024-02-29', 113.00, '4'),
('OR005', 'CUS003', '2024-03-01', 2600.00, '1'),
('OR006', 'CUS003', '2024-03-01', 7025.00, '4'),
('OR007', 'cus001', '2024-03-05', 200.00, '4'),
('OR008', 'cus001', '2024-03-06', 270.00, '3');

-- --------------------------------------------------------

--
-- Table structure for table `orders_detail`
--

CREATE TABLE `orders_detail` (
  `or_id` varchar(10) NOT NULL,
  `f_id` varchar(10) NOT NULL,
  `qty` double(10,2) NOT NULL,
  `total` double(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `orders_detail`
--

INSERT INTO `orders_detail` (`or_id`, `f_id`, `qty`, `total`) VALUES
('OR001', 'F002', 1.00, 45.00),
('OR002', 'F001', 20.00, 900.00),
('OR002', 'F002', 10.00, 450.00),
('OR003', 'F007', 3.00, 225.00),
('OR003', 'F004', 2.00, 98.00),
('OR004', 'F003', 2.00, 80.00),
('OR004', 'F006', 1.00, 33.00),
('OR005', 'F010', 60.00, 2400.00),
('OR005', 'F005', 2.00, 160.00),
('OR005', 'F003', 1.00, 40.00),
('OR006', 'F010', 30.00, 1200.00),
('OR006', 'F008', 75.00, 3375.00),
('OR006', 'F004', 50.00, 2450.00),
('OR007', 'F007', 1.00, 75.00),
('OR007', 'F008', 1.00, 45.00),
('OR007', 'F010', 2.00, 80.00),
('OR008', 'F003', 2.00, 80.00),
('OR008', 'F009', 2.00, 100.00),
('OR008', 'F008', 2.00, 90.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `pay_id` varchar(10) NOT NULL,
  `or_id` varchar(10) NOT NULL,
  `pay_date` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันที่แจ้ง',
  `transfer_date` datetime DEFAULT NULL COMMENT 'วันที่โอนเงิน',
  `pay_img` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`pay_id`, `or_id`, `pay_date`, `transfer_date`, `pay_img`) VALUES
('PY001', 'OR002', '2024-02-06 20:50:00', '2024-02-06 20:42:00', 'slib-ex.jpg'),
('PY002', 'OR004', '2024-02-29 23:02:36', '2024-02-29 23:02:00', 'à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸ (2).jpg'),
('PY003', 'OR006', '2024-03-01 09:30:12', '2024-03-01 09:29:00', 'à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸ (1).jpg'),
('PY004', 'OR007', '2024-03-05 16:04:25', '2024-03-05 16:00:00', 'à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸ (2).jpg'),
('PY005', 'OR008', '2024-03-06 22:29:33', '2024-03-06 22:29:00', 'à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸.jpg'),
('PY006', 'OR003', '2024-03-06 22:53:08', '2024-03-06 22:51:00', 'à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸ (1).jpg');

-- --------------------------------------------------------

--
-- Table structure for table `recive`
--

CREATE TABLE `recive` (
  `recive_id` varchar(10) NOT NULL,
  `recive_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `recive`
--

INSERT INTO `recive` (`recive_id`, `recive_date`) VALUES
('RC001', '2024-02-02'),
('RC002', '2024-02-02'),
('RC003', '2024-02-02'),
('RC004', '2024-02-02'),
('RC005', '2024-02-02'),
('RC006', '2024-02-02'),
('RC007', '2024-02-02'),
('RC008', '2024-02-16'),
('RC009', '2024-02-29'),
('RC010', '2024-03-01'),
('RC011', '2024-03-05');

-- --------------------------------------------------------

--
-- Table structure for table `recive_detail`
--

CREATE TABLE `recive_detail` (
  `f_detail_id` int(10) NOT NULL,
  `recive_id` varchar(10) NOT NULL,
  `f_id` varchar(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `recive_detail`
--

INSERT INTO `recive_detail` (`f_detail_id`, `recive_id`, `f_id`, `quantity`) VALUES
(1, 'RC001', 'F001', 12),
(2, 'RC001', 'F002', 12),
(3, 'RC002', 'F001', 1),
(4, 'RC003', 'F001', 1),
(5, 'RC004', 'F001', 1),
(6, 'RC005', 'F002', 1),
(7, 'RC006', 'F002', 1),
(8, 'RC007', 'F002', 1),
(9, 'RC008', 'F003', 100),
(10, 'RC008', 'F004', 100),
(11, 'RC008', 'F005', 100),
(12, 'RC008', 'F006', 100),
(13, 'RC008', 'F007', 100),
(14, 'RC008', 'F008', 100),
(15, 'RC009', 'F009', 50),
(16, 'RC009', 'F003', 10),
(17, 'RC010', 'F010', 60),
(18, 'RC010', 'F007', 20),
(19, 'RC010', 'F008', 50),
(20, 'RC011', 'F001', 5),
(21, 'RC011', 'F003', 20),
(22, 'RC011', 'F008', 12);

-- --------------------------------------------------------

--
-- Table structure for table `shipping`
--

CREATE TABLE `shipping` (
  `ship_id` varchar(10) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `ship_date` date NOT NULL,
  `tracking_id` varchar(50) NOT NULL,
  `or_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `shipping`
--

INSERT INTO `shipping` (`ship_id`, `company_name`, `ship_date`, `tracking_id`, `or_id`) VALUES
('SH001', 'kerry', '2024-02-07', '012345', 'OR002'),
('SH002', 'Kerry', '2024-02-29', 'TH01235447', 'OR004'),
('SH003', 'Flash', '2024-03-01', 'TH012345', 'OR006'),
('SH004', 'a', '2024-03-05', '1234', 'OR007');

-- --------------------------------------------------------

--
-- Table structure for table `shop`
--

CREATE TABLE `shop` (
  `shop_id` varchar(10) NOT NULL,
  `shop_name` varchar(50) NOT NULL,
  `shop_img` varchar(255) NOT NULL,
  `address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `emp_id` varchar(10) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `position` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`emp_id`, `username`, `password`, `name`, `email`, `position`) VALUES
('emp00', 'admin', 'admin', 'admin', 'admin@gmail.com', 'admin'),
('emp01', 'porapat', 'paolo555', 'Porapat Duangkaew', 'popopow.660@gmail.com', 'admin'),
('emp02', 'ketwarin', '1234', 'Ketwarin kraisorn', 'ketwarin.kr@rmui.ac.th', 'employee');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD KEY `cusId` (`cus_id`),
  ADD KEY `fruitId` (`f_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`cus_id`),
  ADD UNIQUE KEY `cus_user` (`cus_user`),
  ADD UNIQUE KEY `cus_email` (`cus_email`);

--
-- Indexes for table `fruit`
--
ALTER TABLE `fruit`
  ADD PRIMARY KEY (`f_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`or_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`pay_id`);

--
-- Indexes for table `recive`
--
ALTER TABLE `recive`
  ADD PRIMARY KEY (`recive_id`);

--
-- Indexes for table `recive_detail`
--
ALTER TABLE `recive_detail`
  ADD PRIMARY KEY (`f_detail_id`),
  ADD KEY `fId` (`f_id`);

--
-- Indexes for table `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`ship_id`);

--
-- Indexes for table `shop`
--
ALTER TABLE `shop`
  ADD PRIMARY KEY (`shop_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`emp_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `recive_detail`
--
ALTER TABLE `recive_detail`
  MODIFY `f_detail_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cusId` FOREIGN KEY (`cus_id`) REFERENCES `customer` (`cus_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fruitId` FOREIGN KEY (`f_id`) REFERENCES `fruit` (`f_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recive_detail`
--
ALTER TABLE `recive_detail`
  ADD CONSTRAINT `fId` FOREIGN KEY (`f_id`) REFERENCES `fruit` (`f_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
