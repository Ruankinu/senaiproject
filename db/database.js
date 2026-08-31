import mysql from 'mysql2';

/**
 * Pool de conexões: sobrevive a reinícios do banco e evita o crash
 * por "Connection lost" que ocorria com uma conexão única.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rithmo',
    dateStrings: true,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

pool.getConnection((erro, conexao) => {
    if (erro) {
        console.error('Erro ao conectar com o banco de dados:', erro.message);
        return;
    }

    console.log('Banco de dados RITHMO conectado com sucesso!');
    conexao.release();
});

/** API em Promises para os serviços do MVP. */
export const db = pool.promise();

export default pool;
