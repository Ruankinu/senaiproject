-- RITHMO — esquema do banco de dados (MVP)
-- Uso: mysql -u root < db/schema.sql

CREATE DATABASE IF NOT EXISTS rithmo;
USE rithmo;

-- ------------------------------------------------------------------
-- Usuários (paciente ou psicólogo)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('paciente', 'psicologo') NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Perfil do psicólogo: código de vínculo compartilhado com pacientes
CREATE TABLE IF NOT EXISTS psicologos (
    usuario_id INT PRIMARY KEY,
    codigo CHAR(8) NOT NULL UNIQUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Associação paciente ↔ psicólogo (real e persistida)
CREATE TABLE IF NOT EXISTS vinculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    psicologo_id INT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_vinculo (paciente_id, psicologo_id),
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (psicologo_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Atividades da rotina (Núcleo 1)
CREATE TABLE IF NOT EXISTS atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    prazo DATE NOT NULL,
    horario TIME NULL,
    prioridade ENUM('Baixa', 'Média', 'Alta') NOT NULL DEFAULT 'Média',
    complexidade ENUM('Fácil', 'Moderada', 'Intensa') NOT NULL DEFAULT 'Moderada',
    status ENUM('Pendente', 'Concluída') NOT NULL DEFAULT 'Pendente',
    concluida_em TIMESTAMP NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_atividades_usuario_prazo (usuario_id, prazo),
    INDEX idx_atividades_usuario_status (usuario_id, status)
);

-- ------------------------------------------------------------------
-- Legado (mantido para as rotas antigas continuarem funcionando)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    tarefa TEXT NOT NULL,
    prazo DATE NOT NULL,
    prioridade VARCHAR(20) NOT NULL DEFAULT 'Média',
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
