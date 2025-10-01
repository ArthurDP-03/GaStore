-- Criar database
CREATE DATABASE IF NOT EXISTS GaStore;
USE GaStore;

-- Criar tabela de usuários
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    dtnasc DATE NOT NULL,
    tipo ENUM('cliente','admin') DEFAULT 'cliente'
) ENGINE=InnoDB;

-- Criar tabela de produtos
CREATE TABLE Produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    capa VARCHAR(255),
    preco_atual DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    tipo ENUM('jogo','outro') DEFAULT 'jogo'
) ENGINE=InnoDB;

-- Criar tabela de carrinho
CREATE TABLE Carrinho (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
) ENGINE=InnoDB;

-- Criar tabela de compras
CREATE TABLE Compra (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
) ENGINE=InnoDB;

-- Criar tabela de itens da compra
CREATE TABLE ItemCompra (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_itemcompra_compra FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),
    CONSTRAINT fk_itemcompra_produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
) ENGINE=InnoDB;