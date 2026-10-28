const OcorrenciasService = {
    async listarTodas(filtroTipo = 'todos', filtroTurma = 'todas', textoBusca = '') {
        let query = banco.from('ocorrencias').select('*');

        if (filtroTipo !== 'todos') query = query.eq('tipo', filtroTipo);
        if (filtroTurma !== 'todas') query = query.eq('turma_id', filtroTurma);

        const { data: ocorrencias, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        const { data: turmas } = await banco.from('turma').select('id, nome');
        const { data: alunos } = await banco.from('aluno').select('id, nome');

        let resultado = ocorrencias.map(oc => {
            const turma = turmas?.find(t => t.id === oc.turma_id);
            const aluno = alunos?.find(a => a.id === oc.aluno_id);
            return {
                ...oc,
                turma_nome: turma ? turma.nome : "Turma não encontrada",
                aluno_nome: aluno ? aluno.nome : "Aluno não encontrado"
            };
        });

        if (textoBusca) {
            const termo = textoBusca.toLowerCase();
            resultado = resultado.filter(oc => oc.aluno_nome.toLowerCase().includes(termo));
        }

        return resultado;
    },

    async criar(dados) {
        delete dados.aluno_nome;
        
        const { data, error } = await banco.from('ocorrencias').insert([dados]).select();
        if (error) throw error;
        return data;
    },

    async atualizar(id, dados) {
        delete dados.aluno_nome;

        const { data, error } = await banco.from('ocorrencias').update(dados).eq('id', id).select();
        if (error) throw error;
        return data;
    },

    async excluir(id) {
        const { error } = await banco.from('ocorrencias').delete().eq('id', id);
        if (error) throw error;
    },

    async listarTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    },

    async listarAlunosPorTurma(turmaId) {
        const { data, error } = await banco
            .from('aluno')
            .select('id, nome')
            .eq('turma_id', turmaId)
            .order('nome');
        if (error) throw error;
        return data;
    }
};

window.OcorrenciasService = OcorrenciasService;