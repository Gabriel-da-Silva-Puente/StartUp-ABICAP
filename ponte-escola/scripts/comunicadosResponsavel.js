document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    let filho = null;
    let filhos = [];
    let comunicados = [];
    let autores = {};
    let filtroAtual = 'todos';
    let textoBusca = '';

    // ---------------- FORMATAÇÕES ----------------

    // EX: "Hoje, 08:15" / "Ontem, 16:20" / "09/09, 10:30"
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

    // EX: "26 de setembro"
    function formatarDiaMes(iso) {
        return isoParaData(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    // GRUPO DE DATA DO COMUNICADO: HOJE, ESTA SEMANA, ESTE MÊS OU ANTERIORES
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

    async function carregarComunicados() {
        const container = document.getElementById('lista-comunicados');

        try {
            comunicados = await ComunicadosResponsavelService.listar(filho.id, filho.turma_id);
            autores = await InicioResponsavelService.buscarNomesAutores(comunicados.map(c => c.autor_id));

            renderizarResumo();
            renderizarLista();
        } catch (erro) {
            console.error("Erro ao carregar os comunicados:", erro);
            container.innerHTML = `<p class="painel-vazio">Erro ao carregar os comunicados.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarResumo() {
        const total = comunicados.length;
        const naoLidos = comunicados.filter(c => !c.lido).length;
        const eventos = comunicados.filter(c => c.tipo === 'evento').length;
        const porcentagem = total === 0 ? 100 : Math.round(((total - naoLidos) / total) * 100);

        document.getElementById('resumo-comunicados').innerHTML = `
            <div class="resumo-progresso">
                <div class="resumo-progresso-topo">
                    <div>
                        <strong>${naoLidos === 0 ? "Você está em dia 🎉" : `${plural(naoLidos, "comunicado novo", "comunicados novos")}`}</strong>
                        <span>${total - naoLidos} de ${total} lidos</span>
                    </div>
                    ${naoLidos > 0 ? `<button class="btn-marcar-todos" id="btn-marcar-todos">Marcar todos como lidos</button>` : ""}
                </div>
                <div class="barra-progresso"><div class="barra-progresso-preenchimento" style="width: ${porcentagem}%"></div></div>
            </div>
            <div class="resumo-numero"><strong>${total}</strong><span>no total</span></div>
            <div class="resumo-numero"><strong>${eventos}</strong><span>eventos</span></div>
        `;

        const btnTodos = document.getElementById('btn-marcar-todos');
        if (btnTodos) btnTodos.addEventListener("click", marcarTodosComoLidos);
    }

    function renderizarLista() {
        const container = document.getElementById('lista-comunicados');

        const filtrados = comunicados.filter(c => {
            if (filtroAtual === 'nao-lidos' && c.lido) return false;
            if ((filtroAtual === 'comunicado' || filtroAtual === 'evento') && c.tipo !== filtroAtual) return false;

            const busca = textoBusca.toLowerCase();
            return !busca || c.titulo.toLowerCase().includes(busca) || c.descricao.toLowerCase().includes(busca);
        });

        if (filtrados.length === 0) {
            container.innerHTML = `<p class="painel-vazio">Nenhum comunicado encontrado.</p>`;
            return;
        }

        // AGRUPA POR PERÍODO MANTENDO A ORDEM (JÁ VEM DO MAIS NOVO PARA O MAIS ANTIGO)
        const grupos = {};
        filtrados.forEach(c => {
            const nomeGrupo = grupoDaData(c.created_at);
            (grupos[nomeGrupo] = grupos[nomeGrupo] || []).push(c);
        });

        container.innerHTML = Object.entries(grupos).map(([nomeGrupo, itens]) => `
            <h4 class="titulo-grupo">${nomeGrupo}</h4>
            <div class="grade-comunicados">
                ${itens.map(cartaoComunicado).join("")}
            </div>
        `).join("");

        container.querySelectorAll('.cartao-comunicado').forEach(cartao => {
            cartao.addEventListener("click", () => {
                abrirComunicado(comunicados.find(c => c.id == cartao.dataset.id));
            });
        });
    }

    function cartaoComunicado(c) {
        const ehEvento = c.tipo === 'evento';
        const autor = autores[c.autor_id] || "Coordenação Pedagógica";

        // EVENTOS COM DATA MOSTRAM UM "CALENDÁRIO" NO LUGAR DO ÍCONE
        const destaque = ehEvento && c.data_evento
            ? `<div class="data-evento">
                    <strong>${isoParaData(c.data_evento).getDate()}</strong>
                    <span>${isoParaData(c.data_evento).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
               </div>`
            : `<div class="icone-comunicado ${ehEvento ? 'roxo' : 'azul'}">
                    <span class="icone-mascara" style="--icone: url('../assets/icons/${ehEvento ? 'calendar-days' : 'megaphone'}.svg')"></span>
               </div>`;

        return `
            <button class="cartao-comunicado ${c.lido ? '' : 'nao-lido'} ${ehEvento ? 'evento' : ''}" data-id="${c.id}">
                ${destaque}
                <div class="cartao-comunicado-info">
                    <div class="cartao-comunicado-topo">
                        <span class="badge-tipo badge-${c.tipo}">${c.tipo}</span>
                        ${c.lido ? '' : '<span class="ponto-novo" title="Novo"></span>'}
                    </div>
                    <p class="cartao-comunicado-titulo">${escaparHtml(c.titulo)}</p>
                    <p class="cartao-comunicado-texto">${escaparHtml(c.descricao)}</p>
                    <p class="item-atualizacao-meta">${escaparHtml(autor)} · ${formatarDataHora(c.created_at)}</p>
                </div>
            </button>
        `;
    }

    // ---------------- AÇÕES ----------------

    // MODAL DO COMUNICADO (MARCA COMO LIDO AO ABRIR)
    async function abrirComunicado(c) {
        const badge = document.getElementById('comunicado-tipo');
        badge.textContent = c.tipo;
        badge.className = `badge-tipo badge-${c.tipo}`;

        document.getElementById('comunicado-titulo').textContent = c.titulo;
        document.getElementById('comunicado-meta').textContent =
            `${autores[c.autor_id] || "Coordenação Pedagógica"} · ${formatarDataHora(c.created_at)}`;
        document.getElementById('comunicado-descricao').textContent = c.descricao;

        const dataEvento = document.getElementById('comunicado-data-evento');
        dataEvento.hidden = !c.data_evento;
        if (c.data_evento) dataEvento.textContent = `📅 ${formatarDiaMes(c.data_evento)}`;

        document.getElementById('modal-comunicado').showModal();

        if (!c.lido) {
            try {
                await AvisosService.marcarComoLido(c.id, [filho.id]);
                c.lido = true;
                renderizarResumo();
                renderizarLista();
            } catch (erro) {
                console.error("Erro ao marcar como lido:", erro);
            }
        }
    }

    async function marcarTodosComoLidos() {
        const naoLidos = comunicados.filter(c => !c.lido).map(c => c.id);

        try {
            await ComunicadosResponsavelService.marcarVariosComoLidos(naoLidos, filho.id);
            comunicados.forEach(c => { c.lido = true; });
            renderizarResumo();
            renderizarLista();
            mostrarAviso("Todos os comunicados foram marcados como lidos.");
        } catch (erro) {
            console.error("Erro ao marcar todos como lidos:", erro);
            mostrarAviso("Não foi possível marcar como lidos.");
        }
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.querySelectorAll('[data-fechar]').forEach(botao => {
        botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
    });

    document.getElementById('busca-comunicados').addEventListener("input", (e) => {
        textoBusca = e.target.value.trim();
        renderizarLista();
    });

    document.querySelectorAll('#filtros-comunicados .chip').forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll('#filtros-comunicados .chip').forEach(c => c.classList.remove('ativo'));
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
        document.getElementById('subtitulo-comunicados').textContent = "Nenhum aluno vinculado a este responsável.";
        document.getElementById('lista-comunicados').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        return;
    }

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    carregarComunicados();
});
