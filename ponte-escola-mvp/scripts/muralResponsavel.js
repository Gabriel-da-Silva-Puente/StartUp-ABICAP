document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    let filho = null;
    let filhos = [];
    let posts = [];
    let postAberto = null;

    // MESMA CHAVE USADA NO MURAL DO PROFESSOR (LISTA DE IDS DOS POSTS CURTIDOS)
    function getPostsCurtidos() {
        return JSON.parse(localStorage.getItem('postsCurtidos')) || [];
    }

    // ---------------- FORMATAÇÕES ----------------

    function iniciais(nome) {
        const partes = nome.trim().split(" ");
        return partes.length > 1
            ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
            : partes[0][0].toUpperCase();
    }

    // EX: "12 de setembro"
    function formatarData(dataISO) {
        return new Date(dataISO).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    function plural(qtd, singular, pluralTexto) {
        return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
    }

    // ---------------- CARREGAMENTO ----------------

    async function carregarMural() {
        const galeria = document.getElementById('galeria-mural');

        try {
            posts = await MuralService.listarPosts(filho.turma_id);
            renderizarResumo();
            renderizarGaleria();
        } catch (erro) {
            console.error("Erro ao carregar o mural:", erro);
            galeria.innerHTML = `<p class="painel-vazio">Erro ao carregar o mural.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarResumo() {
        const totalCurtidas = posts.reduce((soma, p) => soma + (p.curtidas || 0), 0);
        const totalComentarios = posts.reduce((soma, p) => soma + p.mural_comentarios.length, 0);

        document.getElementById('resumo-mural').innerHTML = `
            <div class="resumo-item"><strong>${posts.length}</strong><span>${posts.length === 1 ? "foto" : "fotos"}</span></div>
            <div class="resumo-item"><strong>${totalCurtidas}</strong><span>${totalCurtidas === 1 ? "curtida" : "curtidas"}</span></div>
            <div class="resumo-item"><strong>${totalComentarios}</strong><span>${totalComentarios === 1 ? "comentário" : "comentários"}</span></div>
        `;
    }

    function renderizarGaleria() {
        const galeria = document.getElementById('galeria-mural');
        const curtidos = getPostsCurtidos();

        if (posts.length === 0) {
            galeria.innerHTML = `<p class="painel-vazio">A professora ainda não publicou fotos. 📷</p>`;
            return;
        }

        galeria.innerHTML = posts.map(post => `
            <button class="foto-cartao" data-id="${post.id}">
                <img src="${post.imagem_url}" alt="Foto da turma" loading="lazy">
                <div class="foto-cartao-sombra">
                    <p>${escaparHtml(post.legenda || "")}</p>
                    <div class="foto-cartao-contagem">
                        <span class="${curtidos.includes(post.id) ? 'curtido' : ''}">${curtidos.includes(post.id) ? '❤️' : '🤍'} ${post.curtidas || 0}</span>
                        <span>💬 ${post.mural_comentarios.length}</span>
                    </div>
                </div>
            </button>
        `).join("");

        galeria.querySelectorAll('.foto-cartao').forEach(cartao => {
            cartao.addEventListener("click", () => abrirFoto(posts.find(p => p.id == cartao.dataset.id)));
        });
    }

    // PREENCHE O BOTÃO DE CURTIR E A LISTA DE COMENTÁRIOS DA FOTO ABERTA
    function renderizarDetalhe() {
        const curtido = getPostsCurtidos().includes(postAberto.id);

        const btnCurtir = document.getElementById('btn-curtir');
        btnCurtir.className = `btn-curtir ${curtido ? 'curtido' : ''}`;
        btnCurtir.textContent = `${curtido ? '❤️' : '🤍'} ${plural(postAberto.curtidas || 0, "curtida", "curtidas")}`;

        const comentarios = postAberto.mural_comentarios;
        document.getElementById('foto-comentarios').innerHTML = comentarios.length === 0
            ? `<p class="painel-vazio">Nenhum comentário ainda. Seja o primeiro!</p>`
            : comentarios.map(c => `
                <div class="comentario-item">
                    <span class="comentario-avatar">${iniciais(c.autor_nome)}</span>
                    <div>
                        <strong>${escaparHtml(c.autor_nome)}</strong>
                        <p>${escaparHtml(c.texto)}</p>
                    </div>
                </div>
            `).join("");
    }

    // ---------------- AÇÕES ----------------

    function abrirFoto(post) {
        postAberto = post;
        const nomeAutor = post.administrador?.nome || "Professor";

        document.getElementById('foto-imagem').src = post.imagem_url;
        document.getElementById('foto-avatar').textContent = iniciais(nomeAutor);
        document.getElementById('foto-autor').textContent = nomeAutor;
        document.getElementById('foto-data').textContent = `Publicado em ${formatarData(post.created_at)}`;
        document.getElementById('foto-legenda').textContent = post.legenda || "";
        document.getElementById('input-comentario').value = "";

        renderizarDetalhe();
        document.getElementById('modal-foto').showModal();
    }

    async function alternarCurtida() {
        let curtidos = getPostsCurtidos();
        const jaCurtido = curtidos.includes(postAberto.id);

        try {
            if (jaCurtido) {
                await MuralService.descurtirPost(postAberto.id, postAberto.curtidas || 0);
                postAberto.curtidas = Math.max(0, (postAberto.curtidas || 0) - 1);
                curtidos = curtidos.filter(id => id !== postAberto.id);
            } else {
                await MuralService.curtirPost(postAberto.id, postAberto.curtidas || 0);
                postAberto.curtidas = (postAberto.curtidas || 0) + 1;
                curtidos.push(postAberto.id);
            }
            localStorage.setItem('postsCurtidos', JSON.stringify(curtidos));

            renderizarDetalhe();
            renderizarResumo();
            renderizarGaleria();
        } catch (erro) {
            console.error("Erro ao curtir:", erro);
            mostrarAviso("Não foi possível curtir a foto.");
        }
    }

    async function enviarComentario() {
        const input = document.getElementById('input-comentario');
        const texto = input.value.trim();
        if (!texto) return;

        const nomeAutor = localStorage.getItem('usuarioLogadoNome') || "Responsável";

        try {
            await MuralService.comentar(postAberto.id, nomeAutor, texto);

            // ADICIONA NA TELA SEM RECARREGAR O MURAL INTEIRO
            postAberto.mural_comentarios.push({ autor_nome: nomeAutor, texto, created_at: new Date().toISOString() });
            input.value = "";

            renderizarDetalhe();
            renderizarResumo();
            renderizarGaleria();
        } catch (erro) {
            console.error("Erro ao comentar:", erro);
            mostrarAviso("Não foi possível enviar o comentário.");
        }
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.querySelectorAll('[data-fechar]').forEach(botao => {
        botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
    });
    document.getElementById('btn-curtir').addEventListener("click", alternarCurtida);
    document.getElementById('btn-comentar').addEventListener("click", enviarComentario);
    document.getElementById('input-comentario').addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviarComentario();
    });

    try {
        ({ filho, filhos } = await obterFilhoSelecionado(idLogado));
    } catch (erro) {
        console.error("Erro ao buscar filhos do responsável:", erro);
    }

    if (!filho) {
        document.getElementById('subtitulo-mural').textContent = "Nenhum aluno vinculado a este responsável.";
        document.getElementById('galeria-mural').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        return;
    }

    document.getElementById('subtitulo-mural').textContent =
        `Fotos e recados da turma ${filho.turma?.nome || ""} no dia a dia da escola.`;

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    carregarMural();
});
