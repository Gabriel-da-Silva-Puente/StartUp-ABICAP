(function () {
    // Texto exibido enquanto o administrador ainda não escreveu um texto geral.
    const TEXTO_PADRAO = 'Bem-vindo à Central de Dúvidas do PonteEscola.\n\nAqui você encontra informações gerais sobre a escola, como horários, regras, contatos e procedimentos.\n\nSe não encontrar o que procura, entre em contato com a secretaria.';

    // --- Elementos da página ---
    // Texto geral e lista de tópicos.
    const textoGeralEl = document.getElementById('texto-geral-conteudo');
    const listaEl = document.getElementById('lista-topicos');

    // Modal e campo para editar o texto geral.
    const modalGeral = document.getElementById('modal-texto-geral');
    const formGeral = document.getElementById('form-texto-geral');
    const inputGeral = document.getElementById('texto-geral-input');

    // Modal e campos para criar/editar um tópico.
    const modalTopico = document.getElementById('modal-topico');
    const formTopico = document.getElementById('form-topico');
    const tituloModalTopico = document.getElementById('modal-topico-titulo');
    const inputTitulo = document.getElementById('topico-titulo');
    const inputConteudo = document.getElementById('topico-conteudo');

    // --- Estado ---
    // Tópicos carregados, id do tópico em edição (null = novo) e texto geral atual.
    let topicos = [];
    let idEditando = null;
    let textoGeralAtual = TEXTO_PADRAO;

    // Ícones SVG usados nos cards (seta de abrir/fechar, editar e excluir).
    const iconeSeta = '<svg class="card-topico-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    const iconeEditar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
    const iconeExcluir = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

    // Busca o texto geral no banco; se não houver, usa o texto padrão.
    // textContent (e não innerHTML) evita que o texto seja interpretado como HTML.
    async function carregarTextoGeral() {
        try {
            const texto = await DuvidasService.buscarTextoGeral();
            textoGeralAtual = texto || TEXTO_PADRAO;
        } catch (erro) {
            console.error('Erro ao carregar texto geral:', erro);
        }
        textoGeralEl.textContent = textoGeralAtual;
    }

    // Desenha a lista de tópicos. O conteúdo começa escondido (atributo hidden)
    // e é aberto ao clicar no cabeçalho. escaparHtml protege contra HTML digitado.
    function renderizarTopicos() {
        if (!topicos.length) {
            listaEl.innerHTML = '<p class="lista-vazia">Nenhum tópico cadastrado ainda.</p>';
            return;
        }
        listaEl.innerHTML = topicos.map(t => `
            <article class="card-topico" data-id="${t.id}">
                <div class="card-topico-cabecalho">
                    <h4 class="card-topico-titulo">${escaparHtml(t.titulo)}</h4>
                    <div class="card-topico-acoes">
                        <button type="button" class="btn-acao editar" data-acao="editar" aria-label="Editar tópico">${iconeEditar}</button>
                        <button type="button" class="btn-acao excluir" data-acao="excluir" aria-label="Excluir tópico">${iconeExcluir}</button>
                    </div>
                    ${iconeSeta}
                </div>
                <div class="card-topico-conteudo" hidden>
                    <p>${escaparHtml(t.conteudo)}</p>
                </div>
            </article>`).join('');
    }

    // Busca os tópicos no banco e redesenha a lista.
    async function carregarTopicos() {
        try {
            topicos = await DuvidasService.listarTopicos();
            renderizarTopicos();
        } catch (erro) {
            console.error('Erro ao carregar tópicos:', erro);
            listaEl.innerHTML = '<p class="lista-vazia">Não foi possível carregar os tópicos.</p>';
        }
    }

    // Abrir/fechar, editar e excluir (delegação de eventos)
    // Um único ouvinte de clique para a lista inteira (delegação de eventos):
    // funciona também para cards criados depois.
    listaEl.addEventListener('click', async (e) => {
        // Descobre em qual card o clique aconteceu e se foi em um botão (editar/excluir).
        const card = e.target.closest('.card-topico');
        if (!card) return;
        const id = Number(card.dataset.id);
        const botao = e.target.closest('[data-acao]');

        // Clique fora dos botões: abre/fecha o conteúdo do tópico.
        if (!botao) {
            const conteudo = card.querySelector('.card-topico-conteudo');
            conteudo.hidden = !conteudo.hidden;
            card.classList.toggle('aberto', !conteudo.hidden);
            return;
        }

        // Editar: preenche o modal com os dados do tópico.
        if (botao.dataset.acao === 'editar') {
            const topico = topicos.find(t => t.id === id);
            idEditando = id;
            tituloModalTopico.textContent = 'Editar Tópico';
            inputTitulo.value = topico.titulo;
            inputConteudo.value = topico.conteudo;
            modalTopico.showModal();
        // Excluir: pede confirmação, apaga no banco e recarrega a lista.
        } else if (botao.dataset.acao === 'excluir') {
            if (!confirm('Excluir este tópico?')) return;
            try {
                await DuvidasService.excluirTopico(id);
                mostrarAviso('Tópico excluído.');
                carregarTopicos();
            } catch (erro) {
                console.error('Erro ao excluir tópico:', erro);
                mostrarAviso('Erro ao excluir o tópico.');
            }
        }
    });

    // Botão "Novo Tópico": abre o modal limpo.
    document.getElementById('btn-novo-topico').addEventListener('click', () => {
        idEditando = null;
        formTopico.reset();
        tituloModalTopico.textContent = 'Novo Tópico';
        modalTopico.showModal();
    });
    document.getElementById('btn-cancelar-topico').addEventListener('click', () => modalTopico.close());

    // Salvar tópico: cria um novo ou atualiza o existente (conforme idEditando).
    formTopico.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = inputTitulo.value.trim();
        const conteudo = inputConteudo.value.trim();
        if (!titulo || !conteudo) return;
        try {
            await DuvidasService.salvarTopico(idEditando, titulo, conteudo);
            modalTopico.close();
            mostrarAviso(idEditando ? 'Tópico atualizado!' : 'Tópico criado!');
            carregarTopicos();
        } catch (erro) {
            console.error('Erro ao salvar tópico:', erro);
            mostrarAviso('Erro ao salvar o tópico.');
        }
    });

    // Botão "Editar Texto Geral": abre o modal com o texto atual.
    document.getElementById('btn-editar-geral').addEventListener('click', () => {
        inputGeral.value = textoGeralAtual;
        modalGeral.showModal();
    });
    document.getElementById('btn-cancelar-geral').addEventListener('click', () => modalGeral.close());

    // Salvar o texto geral. Se o campo ficar vazio, volta a valer o texto padrão.
    formGeral.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = inputGeral.value.trim();
        try {
            await DuvidasService.salvarTextoGeral(texto || null);
            textoGeralAtual = texto || TEXTO_PADRAO;
            textoGeralEl.textContent = textoGeralAtual;
            modalGeral.close();
            mostrarAviso('Texto atualizado!');
        } catch (erro) {
            console.error('Erro ao salvar texto geral:', erro);
            mostrarAviso('Erro ao salvar o texto.');
        }
    });

    // Início da página: carrega o texto geral e os tópicos.
    carregarTextoGeral();
    carregarTopicos();
})();