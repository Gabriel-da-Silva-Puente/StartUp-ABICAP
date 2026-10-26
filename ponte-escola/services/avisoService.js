const AvisosService = {

    async excluir(id) {
        const { error } = await banco
            .from('avisos')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async atualizar(id, titulo, descricao, tipo, turmaId, dataEvento) {
        const { data, error } = await banco
            .from('avisos')
            .update({
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                turma_id: turmaId,
                data_evento: dataEvento ? dataEvento : null
            })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    },
    
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

    async listarPorTurma(turmaId, filtroTipo = 'todos', textoBusca = '') {
        let query = banco
            .from('avisos')
            .select(`
                *,
                avisos_lidos ( count )
            `)
            .eq('turma_id', turmaId);

        if (filtroTipo !== 'todos') query = query.eq('tipo', filtroTipo);
        if (textoBusca) query = query.or(`titulo.ilike.%${textoBusca}%,descricao.ilike.%${textoBusca}%`);
        
        const { data: avisos, error: erroAvisos } = await query.order('created_at', { ascending: false });
        if (erroAvisos) throw erroAvisos;
        
        const { count: totalAlunos, error: erroAlunos } = await banco
            .from('aluno') 
            .select('*', { count: 'exact', head: true })
            .eq('turma_id', turmaId);

        if (erroAlunos) throw erroAlunos;
        return { avisos, totalAlunos };
    },

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
    
    async obterEstatisticasAdmin() {
        const { data: avisos, error } = await banco
            .from('avisos')
            .select(`
                id,
                turma_id,
                avisos_lidos ( count ),
                turma ( aluno ( count ) )
            `);

        if (error) throw error;

        let total = avisos.length;
        let aguardando = 0;
        let confirmados = 0;

        avisos.forEach(aviso => {
            const leituras = aviso.avisos_lidos[0]?.count || 0;
            
            const totalAlunos = aviso.turma?.aluno[0]?.count || 0;

            if (totalAlunos > 0 && leituras >= totalAlunos) {
                confirmados++;
            } else {
                aguardando++;
            }
        });

        return { total, aguardando, confirmados };
    },

    async listarTodosAdmin(filtroTipo = 'todos', filtroTurma = 'todas', textoBusca = '') {
        let query = banco
            .from('avisos')
            .select(`
                *,
                administrador ( nome, tipo ), 
                turma ( nome, id ),
                avisos_lidos ( count )
            `);

        if (filtroTipo !== 'todos') query = query.eq('tipo', filtroTipo);
        if (filtroTurma !== 'todas') query = query.eq('turma_id', filtroTurma);
        if (textoBusca) query = query.or(`titulo.ilike.%${textoBusca}%,descricao.ilike.%${textoBusca}%`);

        const { data: avisos, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        const avisosFormatados = await Promise.all(avisos.map(async (aviso) => {
            const { count: totalAlunos } = await banco
                .from('aluno')
                .select('*', { count: 'exact', head: true })
                .eq('turma_id', aviso.turma_id);
            return { ...aviso, total_alunos: totalAlunos || 0 };
        }));

        return avisosFormatados;
    },

    async obterEstatisticasAdmin() {
        const { count: total, error: erroTotal } = await banco
            .from('avisos')
            .select('*', { count: 'exact', head: true });
        if (erroTotal) throw erroTotal;

        const { data: avisos, error: erroAvisos } = await banco
            .from('avisos')
            .select('id, avisos_lidos ( count )');
        if (erroAvisos) throw erroAvisos;
        
        let aguardando = 0;
        let confirmados = 0;
        
        avisos.forEach(a => {
            const leituras = a.avisos_lidos[0]?.count || 0;
            if (leituras > 0) confirmados++;
            else aguardando++;
        });

        return { total, aguardando, confirmados };
    },

    async listarTodasTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    }
};

window.AvisosService = AvisosService;