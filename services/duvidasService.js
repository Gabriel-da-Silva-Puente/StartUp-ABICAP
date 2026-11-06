const DuvidasService = {

    // Busca o texto geral das dúvidas (configuração) do banco de dados
    async buscarTextoGeral() {
        const { data, error } = await banco.from('duvidas_config').select('texto_geral').eq('id', 1).maybeSingle();
        if (error) throw error;
        return data?.texto_geral || null;
    },

    // Salva o texto geral das dúvidas (configuração) no banco de dados
    async salvarTextoGeral(texto) {
        const { error } = await banco.from('duvidas_config').upsert({ id: 1, texto_geral: texto });
        if (error) throw error;
    },

    // Lista todos os tópicos de dúvidas do banco de dados
    async listarTopicos() {
        const { data, error } = await banco.from('duvidas_topicos').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    // Cria ou atualiza um tópico de dúvida. Se id for nulo, cria; se não, atualiza.
    async salvarTopico(id, titulo, conteudo) {
        if (id) {
            const { error } = await banco.from('duvidas_topicos').update({ titulo, conteudo }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await banco.from('duvidas_topicos').insert([{ titulo, conteudo }]);
            if (error) throw error;
        }
    },

    // Exclui um tópico de dúvida do banco de dados
    async excluirTopico(id) {
        const { error } = await banco.from('duvidas_topicos').delete().eq('id', id);
        if (error) throw error;
    }
};

window.DuvidasService = DuvidasService;
