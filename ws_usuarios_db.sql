-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ws_usuarios_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'activo',
  `total` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carritos`
--

LOCK TABLES `carritos` WRITE;
/*!40000 ALTER TABLE `carritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `carritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direcciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `comuna` varchar(50) NOT NULL,
  `ciudad` varchar(50) NOT NULL,
  `region` varchar(50) NOT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `instrucciones` text,
  `predeterminada` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_direcciones_usuario` (`usuario_id`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,2,'Calle Ejemplo 123','Santiago','Santiago','Metropolitana',NULL,NULL,NULL,1,'2025-05-13 01:53:13','2025-05-13 01:53:13'),(2,3,'Calle Ejemplo 123','Las Condes','Santiago','Metropolitana','7550000',NULL,'Casa color blanco',1,'2025-05-13 02:12:06','2025-05-13 02:12:06');
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items_carrito`
--

DROP TABLE IF EXISTS `items_carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items_carrito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `carrito_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `carrito_id` (`carrito_id`),
  CONSTRAINT `items_carrito_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items_carrito`
--

LOCK TABLES `items_carrito` WRITE;
/*!40000 ALTER TABLE `items_carrito` DISABLE KEYS */;
/*!40000 ALTER TABLE `items_carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` enum('email','sms','push') NOT NULL,
  `asunto` varchar(255) DEFAULT NULL,
  `contenido` text NOT NULL,
  `plantilla_id` int DEFAULT NULL,
  `estado` enum('pendiente','enviado','fallido') NOT NULL DEFAULT 'pendiente',
  `destinatario` varchar(255) NOT NULL,
  `datos_adicionales` json DEFAULT NULL,
  `error_mensaje` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `plantilla_id` (`plantilla_id`),
  CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_notificacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (3,1,'email','Prueba de notificación','<p>Este es un mensaje de prueba</p>',NULL,'pendiente','test@example.com',NULL,NULL,'2025-05-12 03:37:37',NULL),(4,1,'email','Bienvenido a FERREMAS - Confirmación de Registro','<h2>¡Gracias por registrarte en FERREMAS!</h2><p>Hola Juan Pérez,</p><p>Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a explorar nuestra tienda y disfrutar de todos los beneficios de ser cliente de FERREMAS.</p><p>Si tienes alguna pregunta, no dudes en contactarnos.</p><p>Saludos cordiales,<br>El equipo de FERREMAS</p>',1,'fallido','juan@example.com','{\"nombre\": \"Juan Pérez\"}','Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials a1e0cc1a2514c-879f6297d59sm4551002241.31 - gsmtp','2025-05-12 03:39:54',NULL);
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_notificacion`
--

DROP TABLE IF EXISTS `plantillas_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas_notificacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('email','sms','push') NOT NULL,
  `asunto` varchar(255) DEFAULT NULL,
  `contenido` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_notificacion`
--

LOCK TABLES `plantillas_notificacion` WRITE;
/*!40000 ALTER TABLE `plantillas_notificacion` DISABLE KEYS */;
INSERT INTO `plantillas_notificacion` VALUES (1,'confirmacion_registro','email','Bienvenido a FERREMAS - Confirmación de Registro','<h2>¡Gracias por registrarte en FERREMAS!</h2><p>Hola {{nombre}},</p><p>Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a explorar nuestra tienda y disfrutar de todos los beneficios de ser cliente de FERREMAS.</p><p>Si tienes alguna pregunta, no dudes en contactarnos.</p><p>Saludos cordiales,<br>El equipo de FERREMAS</p>','2025-05-11 03:18:02','2025-05-11 03:18:02'),(2,'confirmacion_pedido','email','FERREMAS - Confirmación de Pedido #{{pedido_id}}','<h2>¡Gracias por tu compra!</h2><p>Hola {{nombre}},</p><p>Hemos recibido tu pedido #{{pedido_id}} exitosamente.</p><p>Detalles del pedido:</p>{{detalles_pedido}}<p>Tu pedido está siendo procesado y recibirás una notificación cuando esté listo para entrega o despacho.</p><p>Saludos cordiales,<br>El equipo de FERREMAS</p>','2025-05-11 03:18:02','2025-05-11 03:18:02'),(3,'pedido_en_ruta','sms',NULL,'FERREMAS: Tu pedido #{{pedido_id}} está en camino. Tiempo estimado de entrega: {{tiempo_entrega}}. Seguimiento: {{link_seguimiento}}','2025-05-11 03:18:02','2025-05-11 03:18:02'),(4,'stock_disponible','push','Producto disponible','El producto \"{{producto_nombre}}\" que estabas esperando ya está disponible en stock.','2025-05-11 03:18:02','2025-05-11 03:18:02');
/*!40000 ALTER TABLE `plantillas_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrador con acceso total al sistema','2025-05-10 02:50:37'),(2,'vendedor','Vendedor con acceso a ventas y productos','2025-05-10 02:50:37'),(3,'inventario','Gestión de inventario','2025-05-10 02:50:37'),(4,'cliente','Cliente registrado','2025-05-10 02:50:37');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_backup`
--

DROP TABLE IF EXISTS `roles_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_backup` (
  `id` int NOT NULL DEFAULT '0',
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_backup`
--

LOCK TABLES `roles_backup` WRITE;
/*!40000 ALTER TABLE `roles_backup` DISABLE KEYS */;
INSERT INTO `roles_backup` VALUES (1,'admin','Administrador con acceso total al sistema','2025-05-10 02:50:37'),(2,'vendedor','Vendedor con acceso a ventas y productos','2025-05-10 02:50:37'),(3,'inventario','Gestión de inventario','2025-05-10 02:50:37'),(4,'cliente','Cliente registrado','2025-05-10 02:50:37');
/*!40000 ALTER TABLE `roles_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `tipo` enum('reset_password','verificacion_email') NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_tokens_usuario` (`usuario_id`),
  CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('cliente','admin','bodeguero') DEFAULT 'cliente',
  `direccion` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rut` varchar(12) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_usuario_rut` (`rut`),
  KEY `idx_usuario_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Usuario Prueba','test@example.com','password123',NULL,'admin',NULL,1,'2025-05-12 03:37:18','2025-05-13 01:43:51','6080607-7','No especificado',NULL,'2025-05-12 21:43:51'),(2,'Juan','juan@example.com','$2b$10$N5fJh3NlY20JUodFuDOnjOaBAbFT/jPqbekiWpVcGzieoN5lNfd.K','912345678','cliente',NULL,1,'2025-05-13 01:53:12','2025-05-13 01:55:55','12345678-9','Pérez','2025-05-12 21:55:55','2025-05-12 21:53:12'),(3,'Usuario Actualizado','test1747102325908@example.com','$2b$10$BFQKBqHH0Nu5LmAjZz.oWOFIk5rCCE9pUj7EXA9/Tu/52AkvrZ7Ja','912345678','cliente',NULL,1,'2025-05-13 02:12:06','2025-05-13 02:12:06','91555271-4','De Prueba Actualizado','2025-05-12 22:12:06','2025-05-12 22:12:06');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_backup`
--

DROP TABLE IF EXISTS `usuarios_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_backup` (
  `id` int NOT NULL DEFAULT '0',
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `token_recuperacion` varchar(100) DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_backup`
--

LOCK TABLES `usuarios_backup` WRITE;
/*!40000 ALTER TABLE `usuarios_backup` DISABLE KEYS */;
INSERT INTO `usuarios_backup` VALUES (1,'Usuario Prueba','test@example.com','password123',NULL,NULL,1,1,NULL,NULL,NULL,'2025-05-12 03:37:18','2025-05-12 03:37:18');
/*!40000 ALTER TABLE `usuarios_backup` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-12 22:21:46
