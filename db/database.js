import mysql from 'mysql2';

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rithmo'
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar com o banco de dados:', erro.message);
        return;
    }

    console.log('Banco de dados RITHMO conectado com sucesso!');
});

export default conexao;

