const InicioService = {

    // BUSCA A QUANTIDADE DE AVISOS DA TURMA
    async contarAvisos(turmaId) {
        const { count, error } = await banco
            .from('avisos')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turmaId);

        if (error) throw error;
        return count || 0;
    },

    // CONTA QUANTOS AVISOS AINDA TÊM PENDÊNCIAS (NEM TODOS LERAM)
    async contarPendencias(turmaId) {
        const { data: avisos, error: erroAvisos } = await banco
            .from('avisos')
            .select('id, avisos_lidos ( count )')
            .eq('turma_id', turmaId);

        if (erroAvisos) throw erroAvisos;

        const { count: totalAlunos, error: erroAlunos } = await banco
            .from('aluno')
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turmaId);

        if (erroAlunos) throw erroAlunos;

        let pendencias = 0;
        avisos.forEach(aviso => {
            const leituras = aviso.avisos_lidos[0]?.count || 0;
            if (leituras < totalAlunos) {
                pendencias++;
            }
        });

        return pendencias;
    },

    // BUSCA OS ÚLTIMOS 3 AVISOS DA TURMA
    async listarUltimosAvisos(turmaId) {
        const { data, error } = await banco
            .from('avisos')
            .select('id, titulo, tipo, created_at')
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false })
            .limit(3); 
        if (error) throw error;
        return data;
    }
};

window.InicioService = InicioService;