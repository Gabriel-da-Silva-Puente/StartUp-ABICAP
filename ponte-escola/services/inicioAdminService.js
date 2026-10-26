const InicioAdminService = {
    async buscarEstatisticas() {
        const { count: alunos } = await banco.from('aluno').select('*', { count: 'exact', head: true });
        const { count: avisos } = await banco.from('avisos').select('*', { count: 'exact', head: true });
        const { count: turmas } = await banco.from('turma').select('*', { count: 'exact', head: true });
        
        // Ocorrências abertas = total de ocorrências menos as que já foram lidas
        const { data: todasOcorrencias } = await banco.from('ocorrencias').select('id, ocorrencias_lidas(id)');
        
        let abertas = 0;
        if (todasOcorrencias) {
            abertas = todasOcorrencias.filter(o => o.ocorrencias_lidas.length === 0).length;
        }

        return { alunos, avisos, turmas, abertas };
    },

    async buscarOcorrenciasRecentes() {
        const { data, error } = await banco
            .from('ocorrencias')
            .select(`*, aluno ( nome ), ocorrencias_lidas ( id )`)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;
        return data;
    }
};

window.InicioAdminService = InicioAdminService;