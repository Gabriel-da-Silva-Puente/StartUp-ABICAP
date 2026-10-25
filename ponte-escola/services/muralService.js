const MuralService = {
    // BUSCA OS POSTS DA TURMA COM OS COMENTÁRIOS
    async listarPosts(turmaId) {
        const { data, error } = await banco
            .from('mural_posts')
            .select(`
                *,
                administrador ( nome ),
                mural_comentarios ( id, autor_nome, texto, created_at )
            `)
            .eq('turma_id', turmaId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // FAZ O UPLOAD DA IMAGEM E CRIA O POST
    async criarPost(turmaId, autorId, autorNome, legenda, arquivoImagem) {
        const nomeArquivo = `${Date.now()}-${arquivoImagem.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        
        const { error: uploadError } = await banco.storage
            .from('fotos-mural')
            .upload(nomeArquivo, arquivoImagem);

        if (uploadError) throw uploadError;

        const { data: urlData } = banco.storage
            .from('fotos-mural')
            .getPublicUrl(nomeArquivo);

        const { data, error } = await banco
            .from('mural_posts')
            .insert([{
                turma_id: turmaId,
                autor_id: autorId,
                imagem_url: urlData.publicUrl,
                legenda: legenda
            }]).select();

        if (error) throw error;
        return data;
    },

    // DAR LIKE NO POST
    async curtirPost(postId, curtidasAtuais) {
        const { error } = await banco
            .from('mural_posts')
            .update({ curtidas: curtidasAtuais + 1 })
            .eq('id', postId);

        if (error) throw error;
    },

    // ADICIONAR COMENTÁRIO
    async comentar(postId, autorNome, texto) {
        const { error } = await banco
            .from('mural_comentarios')
            .insert([{ post_id: postId, autor_nome: autorNome, texto: texto }]);

        if (error) throw error;
    },

        // DESFAZER LIKE NO POST
    async descurtirPost(postId, curtidasAtuais) {
        const novasCurtidas = Math.max(0, curtidasAtuais - 1); 
        
        const { error } = await banco
            .from('mural_posts')
            .update({ curtidas: novasCurtidas })
            .eq('id', postId);

        if (error) throw error;
    }
};

window.MuralService = MuralService;