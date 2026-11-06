const CalendarioService = {

    // Lista todas as turmas (id e nome) para popular o select de turmas
    async listarTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    },

    // Todos os eventos entre duas datas (YYYY-MM-DD), de quatro fontes:
    //  - 'calendario': eventos criados no próprio calendário (editáveis)
    //  - 'aviso': avisos do tipo "evento" (campo data_evento)
    //  - 'passeio': autorizações de passeio (campo data_evento)
    //  - 'atividade': prazo de entrega das atividades
    // Cada fonte é buscada separadamente: se uma falhar, as outras continuam aparecendo.
    async listarPeriodo(inicio, fim) {
        const turmas = await this.listarTurmas();
        const nomeTurma = {};
        turmas.forEach(t => { nomeTurma[t.id] = t.nome; });
        const doDia = (valor) => String(valor).slice(0, 10);

        const buscas = [
            this._eventosDoCalendario(inicio, fim),
            this._avisosEvento(inicio, fim, nomeTurma, doDia),
            this._passeios(inicio, fim, nomeTurma, doDia),
            this._prazosAtividades(inicio, fim, nomeTurma, doDia)
        ];
        const resultados = await Promise.allSettled(buscas);

        const eventos = [];
        resultados.forEach(r => {
            if (r.status === 'fulfilled') eventos.push(...r.value);
            else console.warn('Fonte de eventos indisponível:', r.reason);
        });
        return eventos.sort((a, b) => a.data.localeCompare(b.data));
    },

    async _eventosDoCalendario(inicio, fim) {
        const { data, error } = await banco
            .from('eventos')
            .select('*, eventos_turmas ( turma_id, turma ( nome ) )')
            .gte('data', inicio)
            .lte('data', fim);
        if (error) throw error;
        return data.map(e => ({ ...e, id: `calendario-${e.id}`, idOriginal: e.id, origem: 'calendario' }));
    },

    async _avisosEvento(inicio, fim, nomeTurma, doDia) {
        const { data, error } = await banco
            .from('avisos')
            .select('id, titulo, descricao, turma_id, data_evento')
            .eq('tipo', 'evento')
            .gte('data_evento', inicio)
            .lte('data_evento', fim);
        if (error) throw error;
        return data.map(a => ({
            id: `aviso-${a.id}`, origem: 'aviso', tipo: 'aviso',
            titulo: a.titulo, descricao: a.descricao, data: doDia(a.data_evento),
            turmas_texto: nomeTurma[a.turma_id] || 'Turma não informada',
            link: 'administrador-avisos.html'
        }));
    },

    async _passeios(inicio, fim, nomeTurma, doDia) {
        const { data, error } = await banco
            .from('autorizacoes')
            .select('id, titulo, local, data_evento, autorizacoes_turmas ( turma_id )')
            .gte('data_evento', inicio)
            .lte('data_evento', fim);
        if (error) throw error;
        return data.map(p => {
            const nomes = (p.autorizacoes_turmas || []).map(t => nomeTurma[t.turma_id]).filter(Boolean);
            return {
                id: `passeio-${p.id}`, origem: 'passeio', tipo: 'passeio',
                titulo: p.titulo, descricao: p.local ? `Local: ${p.local}` : '', data: doDia(p.data_evento),
                turmas_texto: nomes.length ? nomes.join(', ') : 'Turma não informada',
                link: 'administrador-autorizacoes.html'
            };
        });
    },

    async _prazosAtividades(inicio, fim, nomeTurma, doDia) {
        const { data, error } = await banco
            .from('atividades')
            .select('id, titulo, descricao, turma_id, prazo')
            .gte('prazo', inicio)
            .lte('prazo', fim);
        if (error) throw error;
        return data.map(a => ({
            id: `atividade-${a.id}`, origem: 'atividade', tipo: 'entrega',
            titulo: `Entrega: ${a.titulo}`, descricao: a.descricao, data: doDia(a.prazo),
            turmas_texto: nomeTurma[a.turma_id] || 'Turma não informada'
        }));
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
