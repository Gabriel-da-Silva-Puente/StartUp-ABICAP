document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    let filho = null;
    let filhos = [];
    let ocorrencias = [];
    let autores = {};
    let filtroAtual = 'todos';
    let textoBusca = '';

    const NOMES = {
        comportamental: "Acompanhamento em sala",
        saude: "Ocorrência de saúde",
        acidente: "Acidente na escola",
        alimentacao: "Ocorrência de alimentação"
    };
    // ícone e cor de cada tipo
    const VISUAL = {
        comportamental: { icone: 'users', cor: 'roxo' },
        saude: { icone: 'triangle-alert', cor: 'vermelho' },
        acidente: { icone: 'triangle-alert', cor: 'laranja' },
        alimentacao: { icone: 'cooking-pot', cor: 'verde' }
    };

    const nomeDoTipo = (tipo) => NOMES[tipo] || "Ocorrência";
    const visualDoTipo = (tipo) => VISUAL[tipo] || { icone: 'triangle-alert', cor: 'vermelho' };

    // ---------------- FORMATAÇÕES ----------------

    function formatarDataHora(dataISO) {
        const data = new Date(dataISO);
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const hoje = new Date();
        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
        if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
        return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hora}`;
    }

    function grupoDaData(dataISO) {
        const dias = (new Date() - new Date(dataISO)) / 86400000;
        if (new Date(dataISO).toDateString() === new Date().toDateString()) return "Hoje";
        if (dias <= 7) return "Esta semana";
        if (dias <= 30) return "Este mês";
        return "Anteriores";
    }

    function plural(qtd, singular, pluralTexto) {
        return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
    }

    // ---------------- CARREGAMENTO ----------------

    async function carregarOcorrencias() {
        const container = document.getElementById('lista-ocorrencias');

        try {
            ocorrencias = await OcorrenciasResponsavelService.listar(filho.id);
            autores = await InicioResponsavelService.buscarNomesAutores(ocorrencias.map(o => o.autor_id));

            renderizarResumo();
            renderizarLista();
        } catch (erro) {
            console.error("Erro ao carregar as ocorrências:", erro);
            container.innerHTML = `<p class="painel-vazio">Erro ao carregar as ocorrências.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarResumo() {
        const total = ocorrencias.length;
        const naoLidas = ocorrencias.filter(o => !o.lido).length;
        const importantes = ocorrencias.filter(o => o.tipo === 'saude' || o.tipo === 'acidente').length;
        const porcentagem = total === 0 ? 100 : Math.round(((total - naoLidas) / total) * 100);

        document.getElementById('resumo-ocorrencias').innerHTML = `
            <div class="resumo-progresso">
                <div class="resumo-progresso-topo">
                    <div>
                        <strong>${naoLidas === 0 ? "Você está em dia 🎉" : plural(naoLidas, "ocorrência nova", "ocorrências novas")}</strong>
                        <span>${total - naoLidas} de ${total} lidas</span>
                    </div>
                    ${naoLidas > 0 ? `<button class="btn-marcar-todos" id="btn-marcar-todos">Marcar todas como lidas</button>` : ""}
                </div>
                <div class="barra-progresso"><div class="barra-progresso-preenchimento" style="width: ${porcentagem}%"></div></div>
            </div>
            <div class="resumo-numero"><strong>${total}</strong><span>no total</span></div>
            <div class="resumo-numero"><strong>${importantes}</strong><span>saúde/acidente</span></div>
        `;

        const btnTodas = document.getElementById('btn-marcar-todos');
        if (btnTodas) btnTodas.addEventListener("click", marcarTodasComoLidas);
    }

    function renderizarLista() {
        const container = document.getElementById('lista-ocorrencias');

        const filtradas = ocorrencias.filter(o => {
            if (filtroAtual === 'nao-lidos') { if (o.lido) return false; }
            else if (filtroAtual !== 'todos' && o.tipo !== filtroAtual) return false;

            const busca = textoBusca.toLowerCase();
            return !busca
                || nomeDoTipo(o.tipo).toLowerCase().includes(busca)
                || (o.descricao || '').toLowerCase().includes(busca);
        });

        if (filtradas.length === 0) {
            container.innerHTML = `<p class="painel-vazio">${ocorrencias.length === 0
                ? "Nenhuma ocorrência registrada. Está tudo certo por aqui!"
                : "Nenhuma ocorrência encontrada."}</p>`;
            return;
        }

        const grupos = {};
        filtradas.forEach(o => {
            const nomeGrupo = grupoDaData(o.created_at);
            (grupos[nomeGrupo] = grupos[nomeGrupo] || []).push(o);
        });

        container.innerHTML = Object.entries(grupos).map(([nomeGrupo, itens]) => `
            <h4 class="titulo-grupo">${nomeGrupo}</h4>
            <div class="grade-comunicados">
                ${itens.map(cartaoOcorrencia).join("")}
            </div>
        `).join("");

        container.querySelectorAll('.cartao-comunicado').forEach(cartao => {
            cartao.addEventListener("click", () => {
                abrirOcorrencia(ocorrencias.find(o => o.id == cartao.dataset.id));
            });
        });
    }

    function cartaoOcorrencia(o) {
        const visual = visualDoTipo(o.tipo);
        const autor = autores[o.autor_id] || "Escola";

        return `
            <button class="cartao-comunicado ${o.lido ? '' : 'nao-lido'}" data-id="${o.id}">
                <div class="icone-comunicado ${visual.cor}">
                    <span class="icone-mascara" style="--icone: url('../assets/icons/${visual.icone}.svg')"></span>
                </div>
                <div class="cartao-comunicado-info">
                    <div class="cartao-comunicado-topo">
                        <span class="badge-tipo badge-${escaparHtml(o.tipo)}">${escaparHtml(o.tipo)}</span>
                        ${o.lido ? '' : '<span class="ponto-novo" title="Nova"></span>'}
                    </div>
                    <p class="cartao-comunicado-titulo">${escaparHtml(nomeDoTipo(o.tipo))}</p>
                    <p class="cartao-comunicado-texto">${escaparHtml(o.descricao)}</p>
                    <p class="item-atualizacao-meta">${escaparHtml(autor)} · ${formatarDataHora(o.created_at)}</p>
                </div>
            </button>
        `;
    }

    // ---------------- AÇÕES ----------------

    // MODAL DA OCORRÊNCIA (MARCA COMO LIDA AO ABRIR)
    async function abrirOcorrencia(o) {
        if (!o) return;

        const badge = document.getElementById('ocorrencia-tipo');
        badge.textContent = o.tipo;
        badge.className = `badge-tipo badge-${o.tipo}`;

        document.getElementById('ocorrencia-titulo').textContent = nomeDoTipo(o.tipo);
        document.getElementById('ocorrencia-meta').textContent =
            `${autores[o.autor_id] || "Escola"} · ${formatarDataHora(o.created_at)}`;
        document.getElementById('ocorrencia-descricao').textContent = o.descricao;

        document.getElementById('modal-ocorrencia').showModal();

        if (!o.lido) {
            try {
                await InicioResponsavelService.marcarOcorrenciaComoLida(o.id, filho.id);
                o.lido = true;
                renderizarResumo();
                renderizarLista();
            } catch (erro) {
                console.error("Erro ao marcar como lida:", erro);
            }
        }
    }

    async function marcarTodasComoLidas() {
        const naoLidas = ocorrencias.filter(o => !o.lido).map(o => o.id);

        try {
            await OcorrenciasResponsavelService.marcarVariosComoLidos(naoLidas, filho.id);
            ocorrencias.forEach(o => { o.lido = true; });
            renderizarResumo();
            renderizarLista();
            mostrarAviso("Todas as ocorrências foram marcadas como lidas.");
        } catch (erro) {
            console.error("Erro ao marcar todas como lidas:", erro);
            mostrarAviso("Não foi possível marcar como lidas.");
        }
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.querySelectorAll('[data-fechar]').forEach(botao => {
        botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
    });

    document.getElementById('busca-ocorrencias').addEventListener("input", (e) => {
        textoBusca = e.target.value.trim();
        renderizarLista();
    });

    document.querySelectorAll('#filtros-ocorrencias .chip').forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll('#filtros-ocorrencias .chip').forEach(c => c.classList.remove('ativo'));
            chip.classList.add('ativo');
            filtroAtual = chip.dataset.filtro;
            renderizarLista();
        });
    });

    try {
        ({ filho, filhos } = await obterFilhoSelecionado(idLogado));
    } catch (erro) {
        console.error("Erro ao buscar filhos do responsável:", erro);
    }

    if (!filho) {
        document.getElementById('subtitulo-ocorrencias').textContent = "Nenhum aluno vinculado a este responsável.";
        document.getElementById('lista-ocorrencias').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        return;
    }

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    carregarOcorrencias();
});
