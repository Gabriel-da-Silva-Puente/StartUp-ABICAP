const ComunicadosResponsavelService = {

    // TODOS OS COMUNICADOS DA TURMA, MARCANDO QUAIS O ALUNO JÁ LEU
    async listar(alunoId, turmaId) {
        const { data, error } = await banco
            .from('avisos')
            .select('id, titulo, descricao, tipo, autor_id, data_evento, created_at, avisos_lidos ( aluno_id )')
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(aviso => ({
            ...aviso,
            lido: aviso.avisos_lidos.some(l => l.aluno_id == alunoId)
        }));
    },

    // MARCA VÁRIOS COMUNICADOS COMO LIDOS DE UMA VEZ (IGNORA OS JÁ LIDOS)
    async marcarVariosComoLidos(avisosIds, alunoId) {
        if (avisosIds.length === 0) return;

        const registros = avisosIds.map(id => ({ aviso_id: id, aluno_id: alunoId }));
        const { error } = await banco
            .from('avisos_lidos')
            .upsert(registros, { onConflict: 'aviso_id,aluno_id', ignoreDuplicates: true });

        if (error) throw error;
    }
};

window.ComunicadosResponsavelService = ComunicadosResponsavelService;
