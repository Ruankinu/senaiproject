import { buscarOnde } from '../db/jsonStore.js';

const BADGES = [
    { id: 'primeiro-passo', nome: 'Primeiro passo', meta: 1 },
    { id: 'sete-dias', nome: '7 dias', meta: 7 },
    { id: 'um-mes', nome: '1 mês', meta: 30 },
    { id: 'seis-meses', nome: '6 meses', meta: 180 },
    { id: 'um-ano', nome: '1 ano', meta: 365 }
];

function hojeLocal() {
    const agora = new Date();
    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function paraData(texto) {
    const partes = String(texto).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!partes) return null;
    return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

function diasEntre(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Regra de streak (motivadora, sem punição):
 * um dia conta para a sequência quando o paciente concluiu pelo menos uma
 * atividade planejada naquele dia (prazo = dia).
 */
function datasConcluidas(usuarioId) {
    const concluidas = buscarOnde(
        'atividades',
        (a) => a.usuarioId === Number(usuarioId) && a.status === 'Concluída'
    );

    const datas = concluidas
        .map((linha) => paraData(linha.prazo))
        .filter(Boolean)
        .sort((a, b) => a.getTime() - b.getTime());

    return [...new Set(datas.map((data) => data.getTime()))].map(
        (ms) => new Date(ms)
    );
}

function melhorSequencia(datas) {
    let melhor = 0;
    let atual = 0;
    let anterior = null;

    for (const data of datas) {
        if (anterior && diasEntre(anterior, data) === 1) {
            atual += 1;
        } else {
            atual = 1;
        }
        melhor = Math.max(melhor, atual);
        anterior = data;
    }

    return melhor;
}

function sequenciaAtual(datas) {
    const hoje = hojeLocal();
    const conjunto = new Set(datas.map((data) => data.getTime()));
    const ontem = new Date(hoje.getTime() - 86_400_000);

    // A sequência continua viva mesmo sem atividade concluída ainda hoje.
    let dia = conjunto.has(hoje.getTime()) ? hoje : ontem;
    if (!conjunto.has(dia.getTime())) return 0;

    let sequencia = 0;
    while (conjunto.has(dia.getTime())) {
        sequencia += 1;
        dia = new Date(dia.getTime() - 86_400_000);
    }
    return sequencia;
}

/** Progresso do paciente: streak atual, melhor streak e badges reais. */
export function obterProgresso(usuarioId) {
    const datas = datasConcluidas(usuarioId);
    const melhor = melhorSequencia(datas);
    const streak = sequenciaAtual(datas);

    return {
        streak,
        melhorStreak: melhor,
        badges: BADGES.map((badge) => ({
            ...badge,
            aberta: melhor >= badge.meta,
            progresso: Math.min(melhor, badge.meta)
        }))
    };
}

/** Gera uma data local em YYYY-MM-DD a partir de um deslocamento de dias. */
function deslocarDias(deslocamento) {
    const data = new Date(hojeLocal().getTime() + deslocamento * 86_400_000);
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mes}-${dia}`;
}

function resumoDoDia(pacienteId, dia) {
    const atividades = buscarOnde(
        'atividades',
        (a) => a.usuarioId === Number(pacienteId) && a.prazo === dia
    );

    return {
        data: dia,
        total: atividades.length,
        concluidas: atividades.filter((a) => a.status === 'Concluída').length
    };
}

/** Resumo da rotina do paciente para o psicólogo acompanhar. */
export function obterResumoPaciente(pacienteId) {
    const hoje = deslocarDias(0);
    const progresso = obterProgresso(pacienteId);
    const todas = buscarOnde(
        'atividades',
        (a) => a.usuarioId === Number(pacienteId)
    );

    const atrasadas = todas.filter(
        (a) => a.prazo < hoje && a.status === 'Pendente'
    ).length;

    const ultimos7 = [];
    for (let deslocamento = -6; deslocamento <= 0; deslocamento += 1) {
        ultimos7.push(resumoDoDia(pacienteId, deslocarDias(deslocamento)));
    }

    return {
        hoje: resumoDoDia(pacienteId, hoje),
        atrasadas,
        ultimos7,
        progresso
    };
}
