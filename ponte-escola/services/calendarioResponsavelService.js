const CalendarioResponsavelService = {

    // Todos os eventos da turma entre duas datas (YYYY-MM-DD), de quatro fontes:
    //  - 'calendario': eventos criados pela coordenação (para todas as turmas ou só esta)
    //  - 'aviso': avisos do tipo "evento" da turma
    //  - 'passeio': passeios que incluem a turma
    //  - 'atividade': prazo de entrega das atividades da turma
    // Cada fonte é buscada separadamente: se uma falhar, as outras continuam aparecendo.
    async listarPeriodo(inicio, fim, turmaId) {
        const doDia = (valor) => String(valor).slice(0, 10);

        const resultados = await Promise.allSettled([
            this._eventosDoCalendario(inicio, fim, turmaId),
            this._avisosEvento(inicio, fim, turmaId, doDia),
            this._passeios(inicio, fim, turmaId, doDia),
            this._prazosAtividades(inicio, fim, turmaId, doDia)
        ]);

        const eventos = [];
        resultados.forEach(r => {
            if (r.status === 'fulfilled') eventos.push(...r.value);
            else console.warn('Fonte de eventos indisponível:', r.reason);
        });
        return eventos.sort((a, b) => a.data.localeCompare(b.data));
    },

    async _eventosDoCalendario(inicio, fim, turmaId) {
        const { data, error } = await banco
            .from('eventos')
            .select('id, titulo, descricao, data, tipo, todas_turmas, eventos_turmas ( turma_id )')
            .gte('data', inicio)
            .lte('data', fim);
        if (error) throw error;

        // MANTÉM SÓ OS EVENTOS DE TODAS AS TURMAS OU QUE INCLUEM A TURMA DO ALUNO
        return data
            .filter(e => e.todas_turmas || e.eventos_turmas.some(t => t.turma_id == turmaId))
            .map(e => ({ id: `calendario-${e.id}`, titulo: e.titulo, descricao: e.descricao, data: e.data, tipo: e.tipo }));
    },

    async _avisosEvento(inicio, fim, turmaId, doDia) {
        const { data, error } = await banco
            .from('avisos')
            .select('id, titulo, descricao, data_evento')
            .eq('tipo', 'evento')
            .eq('turma_id', turmaId)
            .gte('data_evento', inicio)
            .lte('data_evento', fim);
        if (error) throw error;
        return data.map(a => ({ id: `aviso-${a.id}`, tipo: 'aviso', titulo: a.titulo, descricao: a.descricao, data: doDia(a.data_evento) }));
    },

    async _passeios(inicio, fim, turmaId, doDia) {
        const { data, error } = await banco
            .from('autorizacoes')
            .select('id, titulo, local, data_evento, autorizacoes_turmas ( turma_id )')
            .gte('data_evento', inicio)
            .lte('data_evento', fim);
        if (error) throw error;
        return data
            .filter(p => p.autorizacoes_turmas.some(t => t.turma_id == turmaId))
            .map(p => ({
                id: `passeio-${p.id}`, tipo: 'passeio', titulo: p.titulo,
                descricao: p.local ? `Local: ${p.local}` : '', data: doDia(p.data_evento)
            }));
    },

    async _prazosAtividades(inicio, fim, turmaId, doDia) {
        const { data, error } = await banco
            .from('atividades')
            .select('id, titulo, descricao, prazo')
            .eq('turma_id', turmaId)
            .gte('prazo', inicio)
            .lte('prazo', fim);
        if (error) throw error;
        return data.map(a => ({ id: `atividade-${a.id}`, tipo: 'entrega', titulo: `Entrega: ${a.titulo}`, descricao: a.descricao, data: doDia(a.prazo) }));
    }
};

window.CalendarioResponsavelService = CalendarioResponsavelService;
