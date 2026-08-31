class Tarefa {
    constructor(id, titulo, tarefa, prazo, prioridade = 'Média') {
        this.id = id;
        this.titulo = titulo;
        this.tarefa = tarefa;
        this.prazo = prazo;
        this.prioridade = prioridade;
        this.status = 'Pendente';
    }

    mostrarDetalhes() {
        console.log(`
        -----------------------------
        TAREFA
        -----------------------------
        ID: ${this.id}
        Título: ${this.titulo}
        Descrição: ${this.tarefa}
        Prazo: ${this.prazo}
        Prioridade: ${this.prioridade}
        Status: ${this.status}
        -----------------------------
        `);
    }

    concluir() {
        this.status = 'Concluída';
    }
}

export default Tarefa;