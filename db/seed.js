/**
 * Seed de demonstração do MVP — cria usuários reais via services,
 * com rotinas de hoje e histórico próximo para exibir streak/badges.
 * Idempotente: não duplica e-mails já existentes.
 *
 * Uso: npm run db:seed
 */
import { db } from './database.js';
import { registrar } from '../services/authService.js';
import { criarAtividade, alternarConclusao } from '../services/rotinaService.js';
import { vincularPorCodigo } from '../services/vinculoService.js';

function dataDeslocada(deslocamento) {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const data = new Date(hoje.getTime() + deslocamento * 86_400_000);
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mes}-${dia}`;
}

async function buscarOuRegistrar(email, dados) {
    const [existentes] = await db.query(
        'SELECT id, nome, email, perfil FROM usuarios WHERE email = ?',
        [email]
    );
    if (existentes.length > 0) return existentes[0];
    const { usuario } = await registrar(dados);
    return usuario;
}

async function temAtividades(usuarioId) {
    const [linhas] = await db.query(
        'SELECT COUNT(*) AS total FROM atividades WHERE usuario_id = ?',
        [usuarioId]
    );
    return linhas[0].total > 0;
}

async function semearAna(ana) {
    if (await temAtividades(ana.id)) return;
    const ontem = dataDeslocada(-1);
    const hoje = dataDeslocada(0);

    const cafe = await criarAtividade(ana.id, {
        titulo: 'Café da manhã sem telas',
        descricao: 'Começar o dia com calma, sem pegar o celular.',
        prazo: ontem,
        horario: '08:00',
        prioridade: 'Média',
        complexidade: 'Fácil'
    });
    await alternarConclusao(ana.id, cafe.id);

    const passeio = await criarAtividade(ana.id, {
        titulo: 'Caminhada no parque',
        descricao: '20 minutos ao ar livre.',
        prazo: ontem,
        horario: '18:00',
        prioridade: 'Baixa',
        complexidade: 'Fácil'
    });
    await alternarConclusao(ana.id, passeio.id);

    await criarAtividade(ana.id, {
        titulo: 'Meditação guiada',
        descricao: '10 minutos de respiração antes do café.',
        prazo: hoje,
        horario: '07:30',
        prioridade: 'Média',
        complexidade: 'Fácil'
    });
    await criarAtividade(ana.id, {
        titulo: 'Estudo de inglês',
        descricao: 'Módulo 4 — vocabulário do trabalho.',
        prazo: hoje,
        horario: '09:30',
        prioridade: 'Alta',
        complexidade: 'Moderada'
    });
    await criarAtividade(ana.id, {
        titulo: 'Ligação para a família',
        descricao: 'Conversar com a mãe no fim da tarde.',
        prazo: hoje,
        horario: '11:00',
        prioridade: 'Média',
        complexidade: 'Fácil'
    });
    await criarAtividade(ana.id, {
        titulo: 'Revisão do plano da semana',
        descricao: 'Reorganizar as prioridades dos próximos dias.',
        prazo: hoje,
        horario: '15:00',
        prioridade: 'Alta',
        complexidade: 'Intensa'
    });
    await criarAtividade(ana.id, {
        titulo: 'Alongamento',
        descricao: 'Sequência de 15 minutos antes de dormir.',
        prazo: hoje,
        horario: '21:30',
        prioridade: 'Baixa',
        complexidade: 'Fácil'
    });
}

async function semearLucas(lucas) {
    if (await temAtividades(lucas.id)) return;
    const hoje = dataDeslocada(0);

    await criarAtividade(lucas.id, {
        titulo: 'Leitura',
        descricao: '10 páginas do livro de narrativa.',
        prazo: hoje,
        horario: '08:00',
        prioridade: 'Média',
        complexidade: 'Fácil'
    });
    await criarAtividade(lucas.id, {
        titulo: 'Tarefas da faculdade',
        descricao: 'Entrega do relatório de pesquisa.',
        prazo: hoje,
        horario: '14:00',
        prioridade: 'Alta',
        complexidade: 'Intensa'
    });
}

async function main() {
    console.log('Semeando dados de demonstração...');

    const psicologa = await buscarOuRegistrar('psicologa@rithmo.app', {
        nome: 'Dra. Marina Costa',
        email: 'psicologa@rithmo.app',
        senha: '123456',
        perfil: 'psicologo'
    });
    const ana = await buscarOuRegistrar('ana@rithmo.app', {
        nome: 'Ana Beatriz',
        email: 'ana@rithmo.app',
        senha: '123456',
        perfil: 'paciente'
    });
    const lucas = await buscarOuRegistrar('lucas@rithmo.app', {
        nome: 'Lucas Ferreira',
        email: 'lucas@rithmo.app',
        senha: '123456',
        perfil: 'paciente'
    });

    // Limpa linhas órfãs (resíduos de execuções anteriores no preview)
    await db.query(
        'DELETE FROM psicologos WHERE usuario_id NOT IN (SELECT id FROM usuarios)'
    );

    // Garante o perfil psicólogo e o código fixo da conta demo
    const [perfilExiste] = await db.query(
        'SELECT 1 FROM psicologos WHERE usuario_id = ?',
        [psicologa.id]
    );
    if (perfilExiste.length === 0) {
        await db.query(
            'INSERT INTO psicologos (usuario_id, codigo) VALUES (?, ?)',
            [psicologa.id, 'RITMO1']
        );
    } else {
        await db.query(
            "UPDATE psicologos SET codigo = 'RITMO1' WHERE usuario_id = ?",
            [psicologa.id]
        );
    }

    await vincularPorCodigo(ana.id, 'RITMO1');
    await vincularPorCodigo(lucas.id, 'RITMO1');

    await semearAna(ana);
    await semearLucas(lucas);

    console.log('Seed concluído.');
    console.log('Acesso demo:');
    console.log('  paciente  ana@rithmo.app / 123456');
    console.log('  paciente  lucas@rithmo.app / 123456');
    console.log('  psicóloga psicologa@rithmo.app / 123456 (código RITMO1)');

    process.exit(0);
}

main().catch((erro) => {
    console.error('Erro no seed:', erro);
    process.exit(1);
});
