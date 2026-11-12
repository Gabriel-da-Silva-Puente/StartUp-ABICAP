// CENTRAL DE DÚVIDAS (VISÃO DO RESPONSÁVEL): SOMENTE LEITURA. QUEM ESCREVE É A COORDENAÇÃO.
document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    // Mesmo texto padrão da tela da coordenação, usado enquanto nada foi escrito
    const TEXTO_PADRAO = 'Bem-vindo à Central de Dúvidas do PonteEscola.\n\nAqui você encontra informações gerais sobre a escola, como horários, regras, contatos e procedimentos.\n\nSe não encontrar o que procura, entre em contato com a secretaria.';

    const textoGeralEl = document.getElementById('texto-geral-conteudo');
    const listaEl = document.getElementById('lista-topicos');
    const buscaEl = document.getElementById('busca-duvidas');

    let topicos = [];
    let textoBusca = '';

    const iconeSeta = '<svg class="topico-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

    // ---------------- CARREGAMENTO ----------------

    async function carregarTextoGeral() {
        let texto = null;
        try {
            texto = await DuvidasService.buscarTextoGeral();
        } catch (erro) {
            console.error("Erro ao carregar o texto geral:", erro);
        }
        textoGeralEl.textContent = texto || TEXTO_PADRAO;
    }

    async function carregarTopicos() {
        try {
            topicos = await DuvidasService.listarTopicos();
            renderizarTopicos();
        } catch (erro) {
            console.error("Erro ao carregar os tópicos:", erro);
            listaEl.innerHTML = `<p class="painel-vazio">Não foi possível carregar as dúvidas.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarTopicos() {
        const busca = textoBusca.toLowerCase();
        const filtrados = topicos.filter(t =>
            !busca
            || (t.titulo || '').toLowerCase().includes(busca)
            || (t.conteudo || '').toLowerCase().includes(busca)
        );

        if (filtrados.length === 0) {
            listaEl.innerHTML = `<p class="painel-vazio">${topicos.length === 0
                ? "Nenhum tópico cadastrado ainda."
                : "Nenhum tópico encontrado para essa busca."}</p>`;
            return;
        }

        // Com busca ativa os tópicos já aparecem abertos, para mostrar o trecho encontrado
        listaEl.innerHTML = filtrados.map(t => `
            <article class="topico ${busca ? 'aberto' : ''}">
                <button type="button" class="topico-cabecalho" aria-expanded="${busca ? 'true' : 'false'}">
                    <span class="topico-titulo">${escaparHtml(t.titulo)}</span>
                    ${iconeSeta}
                </button>
                <div class="topico-conteudo" ${busca ? '' : 'hidden'}>
                    <p>${escaparHtml(t.conteudo)}</p>
                </div>
            </article>
        `).join("");
    }

    // ---------------- EVENTOS ----------------

    // Abre/fecha o tópico clicado (um único ouvinte para a lista toda)
    listaEl.addEventListener("click", (e) => {
        const cabecalho = e.target.closest('.topico-cabecalho');
        if (!cabecalho) return;

        const topico = cabecalho.closest('.topico');
        const conteudo = topico.querySelector('.topico-conteudo');
        conteudo.hidden = !conteudo.hidden;
        topico.classList.toggle('aberto', !conteudo.hidden);
        cabecalho.setAttribute('aria-expanded', String(!conteudo.hidden));
    });

    buscaEl.addEventListener("input", (e) => {
        textoBusca = e.target.value.trim();
        renderizarTopicos();
    });

    carregarTextoGeral();
    carregarTopicos();
});
