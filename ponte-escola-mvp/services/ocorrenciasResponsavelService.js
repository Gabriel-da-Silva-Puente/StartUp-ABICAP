const OcorrenciasResponsavelService = {

    // OCORRÊNCIAS DO ALUNO, MARCANDO QUAIS O RESPONSÁVEL JÁ LEU (ocorrencias_lidas: ocorrencia_id, aluno_id)
    async listar(alunoId) {
        const { data, error } = await banco
            .from('ocorrencias')
            .select('id, tipo, descricao, autor_id, created_at, gravidade, providencias, acompanhamento, status, ocorrencias_lidas ( aluno_id )')
            .eq('aluno_id', alunoId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(oc => ({
            ...oc,
            lido: (oc.ocorrencias_lidas || []).some(l => l.aluno_id == alunoId)
        }));
    },

    async marcarVariosComoLidos(ocorrenciasIds, alunoId) {
        if (ocorrenciasIds.length === 0) return;

        const registros = ocorrenciasIds.map(id => ({ ocorrencia_id: id, aluno_id: alunoId }));
        const { error } = await banco
            .from('ocorrencias_lidas')
            .upsert(registros, { onConflict: 'ocorrencia_id,aluno_id', ignoreDuplicates: true });

        if (error) throw error;
    }
};

window.OcorrenciasResponsavelService = OcorrenciasResponsavelService;
