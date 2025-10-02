CREATE DATABASE IF NOT EXISTS exerciciophp;
use exerciciophp;

create table musica(
    id_musica INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100),
    duracao FLOAT,
    compositor VARCHAR(100),
    album VARCHAR(100)
) ENGINE=InnoDB;