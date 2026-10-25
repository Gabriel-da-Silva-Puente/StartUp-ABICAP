const AutorizacoesService = {

    // BUSCA TODAS AS AUTORIZAÇÕES DA TURMA DO PROFESSOR
    async listarPorTurma(turmaId) {
        const { data, error } = await banco
            .from('autorizacoes')
            .select(`
                *,
                autorizacoes_turmas!inner ( turma_id ),
                autorizacoes_respostas ( aluno_id, status )
            `)
            .eq('autorizacoes_turmas.turma_id', turmaId)
            .order('data_evento', { ascending: true });

        if (error) throw error;
        return data;
    },

    // BUSCA OS DETALHES (ALUNOS E RESPOSTAS) DE UMA AUTORIZAÇÃO ESPECÍFICA
    async detalharAutorizacao(autorizacaoId) {
        // Pega a autorização
        const { data: autorizacao, error: errAut } = await banco
            .from('autorizacoes')
            .select('*')
            .eq('id', autorizacaoId)
            .single();

        if (errAut) throw errAut;

        
        const turmasIds = await this.buscarTurmasDaAutorizacao(autorizacaoId);
        
        const { data: alunos, error: errAlunos } = await banco
            .from('aluno')
            .select(`id, nome, turma_id, autorizacoes_respostas ( status )`)
            .in('turma_id', turmasIds)
            .eq('autorizacoes_respostas.autorizacao_id', autorizacaoId);

        if (errAlunos) throw errAlunos;

        return { autorizacao, alunos };
    },

    // BUSCA QUAIS TURMAS ESTÃO VINCULADAS A AUTORIZAÇÃO
    async buscarTurmasDaAutorizacao(autorizacaoId) {
        const { data, error } = await banco
            .from('autorizacoes_turmas')
            .select('turma_id')
            .eq('autorizacao_id', autorizacaoId);

        if (error) throw error;
        return data.map(t => t.turma_id);
    }
};

window.AutorizacoesService = AutorizacoesService;