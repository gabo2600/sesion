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
	`numSesion` INT NOT NULL DEFAULT 0,
	/* Vista de catalogo */
	`valorDocumental` INT NOT NULL DEFAULT 0,
	/* Plazo de conservaciòn */
	`enTram` INT NOT NULL DEFAULT 0,
	`enConc` INT NOT NULL DEFAULT 0,
	`valHist` INT NOT NULL DEFAULT 0,
	
	`dispDocumental` INT NOT NULL DEFAULT 0,
	`clasInfo` INT NOT NULL DEFAULT 0,
	/*Comentarios del admin*/
	`obs` VARCHAR(128) NOT NULL DEFAULT '',
	
	`idUsuario` INT NOT NULL,
	`idComite` INT NOT NULL,
	`borrado` TINYINT(1) DEFAULT 0 NOT NULL, 
	PRIMARY KEY (`idSesion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `documento` (
	`idDocumento` INT NOT NULL AUTO_INCREMENT,
	`idTipoDoc` TINYINT NOT NULL,
	`urlDocumento` VARCHAR(2048) NOT NULL,
	`fechaSubida` DATE NOT NULL,
	`idSesion` INT NOT NULL,
	PRIMARY KEY (`idDocumento`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `tipoDoc`(
	`idTipoDoc` INT NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(30) NOT NULL DEFAULT 0 ,
	`nombreArchivo` VARCHAR(30) NOT NULL DEFAULT 0 ,
	PRIMARY KEY (`idTipoDoc`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `observacion` (
	`idObservacion` INT NOT NULL AUTO_INCREMENT,
	`observacion` VARCHAR(8192) NOT NULL,
	`idUsuario` INT NOT NULL,
	`idDocumento` INT NOT NULL,
	PRIMARY KEY (`idObservacion`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `ruc`(
	`idRUC` INT NOT NULL AUTO_INCREMENT,
	`idUsuario` INT NOT NULL DEFAULT 0 ,
	`idComite` INT NOT NULL DEFAULT 0 ,
	`esResp` TINYINT(1) DEFAULT 0 NOT NULL,
	PRIMARY KEY (`idRUC`)
) ENGINE=InnoDB;

INSERT INTO tipoDoc VALUES(NULL,'Acta Final','.ActaFinal.pdf');
INSERT INTO tipoDoc VALUES(NULL,'Convocatoria','.Convocatoria.pdf');
INSERT INTO tipoDoc VALUES(NULL,'Carpeta de trabajo','.CarpetaDeTrabajo.pdf');
INSERT INTO tipoDoc VALUES(NULL,'Acta Preeliminar','.ActaPreeliminar.pdf');


