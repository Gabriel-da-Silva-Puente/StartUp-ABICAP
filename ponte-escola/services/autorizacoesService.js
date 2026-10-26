const AutorizacoesService = {


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

    async detalharAutorizacao(autorizacaoId) {
        const { data: autorizacao, error: errAut } = await banco
            .from('autorizacoes').select('*').eq('id', autorizacaoId).single();
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

    async buscarTurmasDaAutorizacao(autorizacaoId) {
        const { data, error } = await banco.from('autorizacoes_turmas').select('turma_id').eq('autorizacao_id', autorizacaoId);
        if (error) throw error;
        return data.map(t => t.turma_id);
    },


    async listarTodasAdmin() {
        const { data: autorizacoes, error } = await banco.from('autorizacoes').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        const { data: autTurmas } = await banco.from('autorizacoes_turmas').select('*');
        const { data: respostas } = await banco.from('autorizacoes_respostas').select('*');
        const { data: turmas } = await banco.from('turma').select('id, nome');

        return autorizacoes.map(aut => {
            const turmasDestePasseio = autTurmas
                .filter(at => at.autorizacao_id === aut.id)
                .map(at => {
                    const t = turmas.find(turma => turma.id === at.turma_id);
                    return t ? t.nome : "Turma";
                });

            const respostasDestePasseio = respostas.filter(r => r.autorizacao_id === aut.id);
            const ok = respostasDestePasseio.filter(r => r.status === 'autorizado').length;
            const no = respostasDestePasseio.filter(r => r.status === 'recusado').length;
            const pendente = respostasDestePasseio.filter(r => r.status === 'pendente').length;

            return {
                ...aut,
                turmas_nomes: turmasDestePasseio,
                total_ok: ok,
                total_no: no,
                total_pendente: pendente,
                total_geral: ok + no + pendente
            };
        });
    },

    async listarTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    },

    async criar(dados, turmasIds) {
        const { data: aut, error: erroAut } = await banco.from('autorizacoes').insert([dados]).select().single();
        if (erroAut) throw erroAut;

        const registrosTurmas = turmasIds.map(tId => ({
            autorizacao_id: aut.id,
            turma_id: tId
        }));
        
        const { error: erroTurmas } = await banco.from('autorizacoes_turmas').insert(registrosTurmas);
        if (erroTurmas) throw erroTurmas;
        return aut;
    },

    async atualizar(id, dados, turmasIds) {
        const { error: erroAut } = await banco.from('autorizacoes').update(dados).eq('id', id);
        if (erroAut) throw erroAut;

        const { error: erroDelete } = await banco.from('autorizacoes_turmas').delete().eq('autorizacao_id', id);
        if (erroDelete) throw erroDelete;

        const registrosTurmas = turmasIds.map(tId => ({
            autorizacao_id: id,
            turma_id: tId
        }));
        const { error: erroTurmas } = await banco.from('autorizacoes_turmas').insert(registrosTurmas);
        if (erroTurmas) throw erroTurmas;
    },

    async excluir(id) {
        const { error } = await banco.from('autorizacoes').delete().eq('id', id);
        if (error) throw error;
    }
};

window.AutorizacoesService = AutorizacoesService;