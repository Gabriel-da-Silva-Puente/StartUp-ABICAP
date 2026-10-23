const AvisosService = {
    
    // BUSCAR TURMAS DO PROFESSOR 
    async buscarTurmasDoProfessor(professorId) {
        const { data, error } = await banco
            .from('professores_turmas')
            .select(`
                turma_id,
                turma ( id, nome )
            `)
            .eq('administrador_id', professorId); 

        if (error) throw error;
        return data;
    },

    // CRIAR AVISO 
    async criar(titulo, descricao, tipo, turmaId, autorId, dataEvento) {
        
        const novoAviso = {
            titulo: titulo,
            descricao: descricao,
            tipo: tipo,
            turma_id: turmaId,
            autor_id: autorId,
            data_evento: dataEvento ? dataEvento : null
        };

        const { data, error } = await banco
            .from('avisos')
            .insert([novoAviso])
            .select();

        if (error) throw error;
        return data;
    }
};

window.AvisosService = AvisosService;