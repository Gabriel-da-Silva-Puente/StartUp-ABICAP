const MensagensService = {
    // LISTA TODAS AS CONVERSAS
    async listarTodas() {
        const { data: conversas, error } = await banco
            .from('conversas')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        const { data: responsaveis } = await banco.from('responsavel').select('*');
        const { data: mensagens } = await banco.from('mensagens').select('conversa_id, texto').order('created_at', { ascending: true });
        return conversas.map(conv => {
            const remetente = responsaveis?.find(r => r.id === conv.responsavel_id);
            const nomeRemetente = remetente ? (remetente.Nome || remetente.nome || "Responsável") : "Responsável";
            const ultimaMsg = mensagens?.filter(m => m.conversa_id === conv.id).pop();

            return {
                ...conv,
                remetente_nome: nomeRemetente,
                previa: ultimaMsg ? ultimaMsg.texto : "Sem mensagens."
            };
        });
    },

    // ABRE UMA CONVERSA E MARCA COMO LIDA
    async abrirConversa(id) {
        const { data: conversa, error } = await banco
            .from('conversas').select('*').eq('id', id).single();
        if (error) throw error;

        const { data: mensagens } = await banco
            .from('mensagens').select('*').eq('conversa_id', id).order('created_at', { ascending: true });

        if (!conversa.lida_pelo_admin) {
            await banco.from('conversas').update({ lida_pelo_admin: true }).eq('id', id);
        }
        return { conversa, mensagens };
    },

    // ENVIA UMA RESPOSTA DO ADMIN
    async responder(conversaId, texto) {
        const { error } = await banco
            .from('mensagens').insert([{ conversa_id: conversaId, remetente: 'admin', texto: texto }]);
        if (error) throw error;
    },

    // MARCA COMO RESOLVIDO
    async resolver(conversaId) {
        const { error } = await banco
            .from('conversas')
            .update({ status: 'resolvido' })
            .eq('id', conversaId);
        if (error) throw error;
    },

    // LISTAR TURMAS
    async listarTurmas() {
        const { data, error } = await banco.from('turma').select('id, nome').order('nome');
        if (error) throw error;
        return data;
    },

    // LISTAR ALUNOS DE UMA TURMA
    async listarAlunosPorTurma(turmaId) {
        const { data, error } = await banco.from('aluno').select('id, nome, responsavel_id').eq('turma_id', turmaId).order('nome');
        if (error) throw error;
        return data;
    },

    // CRIAR NOVA MENSAGEM
    async criar(assunto, responsavelId, texto) {
        const { data: conv, error: erroConv } = await banco
            .from('conversas')
            .insert([{ assunto, responsavel_id: responsavelId, status: 'aberto', lida_pelo_admin: true }])
            .select().single();
        if (erroConv) throw erroConv;

        await banco.from('mensagens').insert([{ conversa_id: conv.id, remetente: 'admin', texto }]);
        return conv;
    }
};

window.MensagensService = MensagensService;