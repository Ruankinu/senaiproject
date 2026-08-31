-- RITHMO — esquema do banco de dados
-- Uso: mysql -u root < db/schema.sql

CREATE DATABASE IF NOT EXISTS rithmo;
USE rithmo;

CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    tarefa TEXT NOT NULL,
    prazo DATE NOT NULL,
    prioridade VARCHAR(20) NOT NULL DEFAULT 'Média',
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
