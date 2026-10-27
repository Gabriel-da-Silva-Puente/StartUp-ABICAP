const CalendarioService = {

    // Lista todas as turmas (id e nome) para popular o select de turmas
    async listarTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    },

    // Eventos entre duas datas (YYYY-MM-DD), com as turmas de cada um
    async listarPeriodo(inicio, fim) {
        const { data, error } = await banco
            .from('eventos')
            .select('*, eventos_turmas ( turma_id, turma ( nome ) )')
            .gte('data', inicio)
            .lte('data', fim)
            .order('data');
        if (error) throw error;
        return data;
    },

    // Cria ou atualiza um evento. Se id for nulo, cria; se não, atualiza. Retorna o id do evento.
    async salvar(id, { titulo, descricao, data, tipo, todasTurmas, turmaIds }) {
        const dados = { titulo, descricao: descricao || null, data, tipo, todas_turmas: todasTurmas };
        let eventoId = id;

        if (id) {
            const { error } = await banco.from('eventos').update(dados).eq('id', id);
            if (error) throw error;
            const { error: erroDel } = await banco.from('eventos_turmas').delete().eq('evento_id', id);
            if (erroDel) throw erroDel;
        } else {
            const { data: criado, error } = await banco.from('eventos').insert([dados]).select().single();
            if (error) throw error;
            eventoId = criado.id;
        }

        // Se não for para todas as turmas, insere as turmas selecionadas
        if (!todasTurmas && turmaIds.length) {
            const linhas = turmaIds.map(t => ({ evento_id: eventoId, turma_id: t }));
            const { error } = await banco.from('eventos_turmas').insert(linhas);
            if (error) throw error;
        }
        return eventoId;
    },

    // Exclui um evento e suas turmas associadas
    async excluir(id) {
        const { error } = await banco.from('eventos').delete().eq('id', id);
        if (error) throw error;
    }
};

window.CalendarioService = CalendarioService;
