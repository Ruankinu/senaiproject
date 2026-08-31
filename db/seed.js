/**
 * Seed de demonstração do MVP — dados de verdade persistidos em data/*.json.
 *
 * Uso:
 *   npm run db:seed        # semeia (idempotente)
 *   node db/seed.js --reset  # apaga data/ e semeia do zero
 */
import {
    iniciar,
    limparTudo,
    buscarOnde,
    colecaoVazia,
    atualizarOnde,
    inserir
} from './jsonStore.js';
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
    const [existente] = buscarOnde('usuarios', (u) => u.email === email);
    if (existente) return existente;
    const { usuario } = await registrar(dados);
    return usuario;
}

function temAtividades(usuarioId) {
    return !colecaoVazia('atividades') &&
        buscarOnde('atividades', (a) => a.usuarioId === usuarioId).length > 0;
}

async function semearAna(ana) {
    if (temAtividades(ana.id)) return;
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
    if (temAtividades(lucas.id)) return;
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
    const reset = process.argv.includes('--reset');
    await iniciar();

    if (reset) {
        console.log('Reset: apagando data/ e semeando do zero...');
        await limparTudo();
    }

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

    // Código fixo da conta demo de psicólogo.
    const [perfil] = buscarOnde('psicologos', (p) => p.usuarioId === psicologa.id);
    if (perfil) {
        await atualizarOnde(
            'psicologos',
            (p) => p.usuarioId === psicologa.id,
            { codigo: 'RITMO1' }
        );
    } else {
        await inserir('psicologos', { usuarioId: psicologa.id, codigo: 'RITMO1' });
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
}

main().catch((erro) => {
    console.error('Erro no seed:', erro);
    process.exit(1);
});
