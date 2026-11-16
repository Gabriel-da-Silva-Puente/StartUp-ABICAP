const ResponsavelService = {

    // BUSCA OS DADOS DO RESPONSÁVEL LOGADO
    async buscarPerfilCompleto(id) {
        const { data, error } = await banco
            .from('responsavel')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // BUSCA OS FILHOS (ALUNOS) DO RESPONSÁVEL COM A TURMA DE CADA UM
    async listarFilhos(responsavelId) {
        const { data, error } = await banco
            .from('aluno')
            .select('id, nome, turma_id, turma ( id, nome )')
            .eq('responsavel_id', responsavelId)
            .order('nome');

        if (error) throw error;
        return data;
    }
};

window.ResponsavelService = ResponsavelService;
