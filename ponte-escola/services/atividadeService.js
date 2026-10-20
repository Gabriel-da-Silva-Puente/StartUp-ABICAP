const AtividadeService = (() => {
    const CHAVE = 'ponteescola.atividades';
    const TOTAL_ALUNOS = 22;

    const iniciais = [
        { id: 1, titulo: 'Semana da Ciência — trazer material reciclável', descricao: 'Para a feira de ciências da próxima semana, cada aluno deve trazer pelo menos 2 itens recicláveis (garrafas PET, caixas, tampinhas). Serão usados para montar os experimentos em sala.', prazo: '26/09/2026', criadaEm: '19/09/2026', lidas: 14, total: 22 },
        { id: 2, titulo: 'Leitura em casa — escolher livro favorito', descricao: 'Peçam que a criança escolha seu livro favorito e leia em casa esta semana. Na sexta faremos uma roda de conversa onde cada um vai contar a história para os colegas.', prazo: '25/09/2026', criadaEm: '19/09/2026', lidas: 9, total: 22 },
        { id: 3, titulo: 'Pintura com tinta guache — trazer avental', descricao: 'Na quinta-feira teremos aula de pintura. Cada criança deve vir com um avental ou uma camiseta velha para proteger o uniforme.', prazo: '24/09/2026', criadaEm: '18/09/2026', lidas: 22, total: 22 },
        { id: 4, titulo: 'Atividade de coordenação — recortar e colar', descricao: 'Enviamos uma folha de atividades na mochila. A criança deve recortar as figuras dos animais e colar nos locais corretos, com ajuda de um adulto.', prazo: '23/09/2026', criadaEm: '17/09/2026', lidas: 17, total: 22 },
        { id: 5, titulo: 'Pesquisa em família — profissões', descricao: 'Converse com a criança sobre a profissão de alguém da família e peça que desenhe essa pessoa trabalhando. Os desenhos serão expostos no mural da turma.', prazo: '22/09/2026', criadaEm: '16/09/2026', lidas: 12, total: 22 }
    ];

    function salvar(lista) {
        try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) {}
    }

    function listar() {
        try {
            const salvas = JSON.parse(localStorage.getItem(CHAVE));
            if (Array.isArray(salvas)) return salvas;
        } catch (e) {}
        salvar(iniciais);
        return iniciais.slice();
    }

    function criar({ titulo, descricao, prazo }) {
        const [ano, mes, dia] = prazo.split('-');
        const nova = {
            id: Date.now(),
            titulo,
            descricao,
            prazo: `${dia}/${mes}/${ano}`,
            criadaEm: new Date().toLocaleDateString('pt-BR'),
            lidas: 0,
            total: TOTAL_ALUNOS
        };
        const lista = listar();
        lista.unshift(nova);
        salvar(lista);
        return nova;
    }

    return { listar, criar };
})();