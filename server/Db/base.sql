CREATE DATABASE  IF NOT EXISTS sesion;
USE sesion;

CREATE TABLE IF NOT EXISTS `usuario` (
	`idUsuario` INT NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(20) DEFAULT '',
	`apellidoP` VARCHAR(20) DEFAULT '',
	`apellidoM` VARCHAR(20) DEFAULT '',
	`user` VARCHAR(20) DEFAULT '',
	`pass` VARCHAR(512) DEFAULT '',
	`tipoUsuario` TINYINT DEFAULT NULL COMMENT '0=miembro del comite   1=responsable   2=root',
	PRIMARY KEY (`idUsuario`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `comite` (
	`idComite` INT NOT NULL AUTO_INCREMENT,
	`comite` VARCHAR(20) DEFAULT '' COMMENT 'nombre del comite',
	PRIMARY KEY (`idComite`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `sesion` (
	`idSesion` INT NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(20) NOT NULL,
	`fechaInicio` DATE NOT NULL,
	`fechaCierre` DATE NOT NULL,
	`idUsuario` INT NOT NULL,
	`idComite` INT NOT NULL,
	PRIMARY KEY (`idSesion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `documento` (
	`idDocumento` INT NOT NULL AUTO_INCREMENT,
	`tipoDocumento` TINYINT NOT NULL,
	`urlDocumento` VARCHAR(2048) NOT NULL,
	`fechaSubida` DATE NOT NULL,
	`idSesion` INT NOT NULL,
	PRIMARY KEY (`idDocumento`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `observacion` (
	`idObservacion` INT NOT NULL AUTO_INCREMENT,
	`observacion` VARCHAR(8192) NOT NULL,
	`idUsuario` INT NOT NULL,
	`idDocumento` INT NOT NULL,
	PRIMARY KEY (`idObservacion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `RUC`(
	`idRUC` INT NOT NULL AUTO_INCREMENT,
	`idUsuario` INT NOT NULL,
	`idComite` INT NOT NULL,
	PRIMARY KEY (`idRUC`)
) ENGINE=InnoDB;