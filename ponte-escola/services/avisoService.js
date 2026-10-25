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
    },

    // LISTAR AVISOS POR TURMA
    async listarPorTurma(turmaId, filtroTipo = 'todos', textoBusca = '') {
   
        let query = banco
            .from('avisos')
            .select(`
                *,
                avisos_lidos ( count )
            `)
            .eq('turma_id', turmaId);

       
        if (filtroTipo !== 'todos') {
            query = query.eq('tipo', filtroTipo);
        }

        
        if (textoBusca) {
            query = query.or(`titulo.ilike.%${textoBusca}%,descricao.ilike.%${textoBusca}%`);
        }

        
        const { data: avisos, error: erroAvisos } = await query.order('created_at', { ascending: false });

        if (erroAvisos) throw erroAvisos;

        
        const { count: totalAlunos, error: erroAlunos } = await banco
            .from('aluno') 
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turmaId);

        if (erroAlunos) throw erroAlunos;

        return { avisos, totalAlunos };
    },

    // MARCAR AVISO COMO LIDO 
    async marcarComoLido(avisoId, alunosIds) {
        
        const registros = alunosIds.map(alunoId => ({
            aviso_id: avisoId,
            aluno_id: alunoId 
        }));

        const { error } = await banco
            .from('avisos_lidos')
            .insert(registros);
       
        if (error && error.code !== '23505') throw error;
    },
    
    // OBTER AS ESTATISTICAS DO AVISO  
    async obterEstatisticas(turmaId) {
    
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

        
        let aguardando = 0;
        let confirmados = 0;

        avisos.forEach(aviso => {
            const leituras = aviso.avisos_lidos[0]?.count || 0;
        
            if (totalAlunos > 0 && leituras >= totalAlunos) {
                confirmados++;
            } else {
                aguardando++;
            }
        });

        return {
            total: avisos.length,
            aguardando: aguardando,
            confirmados: confirmados
        };
    }

};

window.AvisosService = AvisosService;