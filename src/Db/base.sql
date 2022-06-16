CREATE DATABASE  IF NOT EXISTS sesion;
USE sesion;

CREATE TABLE IF NOT EXISTS `usuario` (
	`idUsuario` INT NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(20) NOT NULL,
	`apellidoP` VARCHAR(20) NOT NULL,
	`apellidoM` VARCHAR(20) NOT NULL,
	`user` VARCHAR(20) NOT NULL,
	`pass` VARCHAR(512) NOT NULL,
	`tipoUsuario` TINYINT DEFAULT NULL COMMENT '0=miembro del comite   1=responsable   2=root',
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idUsuario`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `comite` (
	`idComite` INT NOT NULL AUTO_INCREMENT,
	`comite` VARCHAR(40) NOT NULL COMMENT 'nombre del comite',
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idComite`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sesion` (
	`idSesion` INT NOT NULL AUTO_INCREMENT,
	`asunto` VARCHAR(64) NOT NULL,
	`fechaInicio` DATE NOT NULL,
	`fechaCierre` DATE NOT NULL,
	`idUsuario` INT NOT NULL,
	`idComite` INT NOT NULL,
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL, 
	PRIMARY KEY (`idSesion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `documento` (
	`idDocumento` INT NOT NULL AUTO_INCREMENT,
	`tipoDocumento` TINYINT NOT NULL,
	`urlDocumento` VARCHAR(2048) NOT NULL,
	`fechaSubida` DATE NOT NULL,
	`idSesion` INT NOT NULL,
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idDocumento`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `observacion` (
	`idObservacion` INT NOT NULL AUTO_INCREMENT,
	`observacion` VARCHAR(8192) NOT NULL,
	`idUsuario` INT NOT NULL,
	`idDocumento` INT NOT NULL,
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idObservacion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `ruc`(
	`idRUC` INT NOT NULL AUTO_INCREMENT,
	`idUsuario` INT NOT NULL DEFAULT 0 ,
	`idComite` INT NOT NULL DEFAULT 0 ,
	`esResp` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idRUC`)
) ENGINE=InnoDB;


SELECT comite.idComite,comite,comite.borrado,responsable  FROM comite LEFT JOIN  (SELECT CONCAT(nombre ,' ', apellidoP ,' ', apellidoM) as responsable,ruc.idComite FROM ruc NATURAL JOIN usuario WHERE esResp=1 )  as t1 ON t1.idComite=comite.idComite WHERE comite.borrado=0 AND comite LIKE '%Est%' OR responsable LIKE '%Est%';
