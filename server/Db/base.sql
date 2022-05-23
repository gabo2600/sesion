
CREATE TABLE `usuario` (
	`idUsuario` INT NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(20) DEFAULT '',
	`apellidoP` VARCHAR(20) DEFAULT '',
	`apellidoM` VARCHAR(20) DEFAULT '',
	`user` VARCHAR(30) DEFAULT '',
	`pass` VARCHAR(512) DEFAULT '',
	`tipoUsuario` TINYINT DEFAULT NULL COMMENT '0=miembro del comite   1=responsable   2=root',
	KEY `idUsuario` (`idUsuario`) USING BTREE,
	PRIMARY KEY (`idUsuario`)
) ENGINE=InnoDB;

CREATE TABLE `usuario` (
	`idComite` INT NOT NULL AUTO_INCREMENT,
	`comite` VARCHAR(20) DEFAULT '' COMMENT 'nombre del comite',
	UNIQUE KEY `idComite` (`idComite`) USING BTREE,
	PRIMARY KEY (`idComite`)
) ENGINE=InnoDB;

