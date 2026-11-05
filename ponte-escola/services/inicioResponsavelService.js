const InicioResponsavelService = {

    // BUSCA OS NOMES DOS AUTORES (PROFESSORES) A PARTIR DOS IDS
    async buscarNomesAutores(autoresIds) {
        const ids = [...new Set(autoresIds.filter(Boolean))];
        if (ids.length === 0) return {};

        const { data, error } = await banco
            .from('administrador')
            .select('id, nome')
            .in('id', ids);

        if (error) throw error;

        const nomes = {};
        data.forEach(a => { nomes[a.id] = a.nome; });
        return nomes;
    },

    // AUTORIZAÇÕES ABERTAS DA TURMA QUE O RESPONSÁVEL AINDA NÃO RESPONDEU
    async listarAutorizacoesPendentes(alunoId, turmaId) {
        const { data, error } = await banco
            .from('autorizacoes')
            .select(`
                *,
                autorizacoes_turmas!inner ( turma_id ),
                autorizacoes_respostas ( aluno_id, status )
            `)
            .eq('autorizacoes_turmas.turma_id', turmaId)
            .eq('status', 'aberto')
            .order('prazo_limite', { ascending: true });

        if (error) throw error;

        // SEM RESPOSTA DO ALUNO (OU RESPOSTA 'PENDENTE') = AINDA PENDENTE
        return data.filter(aut => {
            const resposta = aut.autorizacoes_respostas.find(r => r.aluno_id == alunoId);
            return !resposta || resposta.status === 'pendente';
        });
    },

    // REGISTRA A RESPOSTA DO RESPONSÁVEL ('autorizado' OU 'recusado')
    async responderAutorizacao(autorizacaoId, alunoId, status) {
        const { data: existente, error: erroBusca } = await banco
            .from('autorizacoes_respostas')
            .select('autorizacao_id')
            .eq('autorizacao_id', autorizacaoId)
            .eq('aluno_id', alunoId)
            .maybeSingle();

        if (erroBusca) throw erroBusca;

        if (existente) {
            const { error } = await banco
                .from('autorizacoes_respostas')
                .update({ status })
                .eq('autorizacao_id', autorizacaoId)
                .eq('aluno_id', alunoId);
            if (error) throw error;
        } else {
            const { error } = await banco
                .from('autorizacoes_respostas')
                .insert([{ autorizacao_id: autorizacaoId, aluno_id: alunoId, status }]);
            if (error) throw error;
        }
    },

    // AVISOS DA TURMA COM A INFORMAÇÃO DE QUAIS O ALUNO JÁ LEU
    async listarAvisos(alunoId, turmaId) {
        const { data, error } = await banco
            .from('avisos')
            .select('id, titulo, descricao, tipo, autor_id, created_at, avisos_lidos ( aluno_id )')
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return data.map(aviso => ({
            ...aviso,
            lido: aviso.avisos_lidos.some(l => l.aluno_id == alunoId)
        }));
    },

    // MARCA A OCORRÊNCIA COMO LIDA PELO ALUNO (ocorrencias_lidas: ocorrencia_id, aluno_id)
    async marcarOcorrenciaComoLida(ocorrenciaId, alunoId) {
        const { error } = await banco
            .from('ocorrencias_lidas')
            .insert([{ ocorrencia_id: ocorrenciaId, aluno_id: alunoId }]);
        if (error && error.code !== '23505') throw error;
    },

    // OCORRÊNCIAS REGISTRADAS PARA O ALUNO
    async listarOcorrencias(alunoId) {
        const { data, error } = await banco
            .from('ocorrencias')
            .select('id, tipo, descricao, autor_id, created_at, ocorrencias_lidas ( aluno_id )')
            .eq('aluno_id', alunoId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return data.map(oc => ({
            ...oc,
            lido: oc.ocorrencias_lidas.some(l => l.aluno_id == alunoId)
        }));
    },

    // ATIVIDADES COM PRAZO EM ABERTO, MARCANDO AS QUE O ALUNO JÁ CONFIRMOU
    async listarAtividadesAbertas(alunoId, turmaId, hojeISO) {
        const { data, error } = await banco
            .from('atividades')
            .select('id, titulo, prazo, atividades_lidas ( aluno_id )')
            .eq('turma_id', turmaId)
            .gte('prazo', hojeISO)
            .order('prazo', { ascending: true });

        if (error) throw error;

        return data.map(ativ => ({
            ...ativ,
            lida: ativ.atividades_lidas.some(l => l.aluno_id == alunoId)
        }));
    },

    // EVENTOS DO PERÍODO QUE VALEM PARA A TURMA (TODAS AS TURMAS OU ESPECÍFICO)
    async listarEventosPeriodo(turmaId, inicio, fim) {
        const { data, error } = await banco
            .from('eventos')
            .select('id, titulo, data, todas_turmas, eventos_turmas ( turma_id )')
            .gte('data', inicio)
            .lte('data', fim)
            .order('data');

        if (error) throw error;

        return data.filter(ev =>
            ev.todas_turmas || ev.eventos_turmas.some(t => t.turma_id == turmaId)
        );
    }
};

window.InicioResponsavelService = InicioResponsavelService;
