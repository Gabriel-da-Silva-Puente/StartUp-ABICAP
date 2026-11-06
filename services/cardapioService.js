const CardapioService = {

    // Busca os dias entre duas datas
    async listarPeriodo(inicio, fim) {
        const { data, error } = await banco
            .from('cardapio')
            .select('*')
            .gte('data', inicio)
            .lte('data', fim)
            .order('data');
        if (error) throw error;
        return data;
    },

    // dias: [{ data, cafe, almoco, lanche }]. Cria ou atualiza; dias totalmente vazios são removidos.
    async salvarSemana(dias) {
        const preenchidos = dias.filter(d => d.cafe || d.almoco || d.lanche);
        const vazios = dias.filter(d => !(d.cafe || d.almoco || d.lanche)).map(d => d.data);

        if (preenchidos.length) {
            const { error } = await banco.from('cardapio').upsert(preenchidos, { onConflict: 'data' });
            if (error) throw error;
        }
        if (vazios.length) {
            const { error } = await banco.from('cardapio').delete().in('data', vazios);
            if (error) throw error;
        }
    }
};

// Exporta o serviço para ser usado em outros arquivos
window.CardapioService = CardapioService;
