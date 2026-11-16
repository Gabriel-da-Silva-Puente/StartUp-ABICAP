document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    let filho = null;
    let filhos = [];
    let passeios = [];
    let passeioAberto = null;
    let filtroAtual = 'todos';
    let textoBusca = '';

    const ROTULOS = { pendente: "Aguardando resposta", autorizado: "Autorizado", recusado: "Não autorizado" };
    const COR_ICONE = { pendente: 'laranja', autorizado: 'verde', recusado: 'vermelho' };

    // ---------------- AUXILIARES ----------------

    function hojeISO() { return dataParaISO(new Date()); }

    // O PRAZO PARA RESPONDER É O prazo_limite (SE NÃO TIVER, USA A DATA DO EVENTO)
    function prazoDe(p) { return p.prazo_limite || p.data_evento; }

    function formatarDiaMes(iso) {
        return isoParaData(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    // STATUS DA RESPOSTA DESTE ALUNO: pendente, autorizado ou recusado
    function statusDe(p) {
        const r = (p.autorizacoes_respostas || []).find(x => x.aluno_id == filho.id);
        return r && r.status ? r.status : 'pendente';
    }

    function encerrado(p) {
        const prazo = prazoDe(p);
        return !!prazo && prazo < hojeISO();
    }

    function grupoDe(p) {
        if (statusDe(p) === 'pendente') return encerrado(p) ? "Encerrados" : "Aguardando resposta";
        return "Respondidos";
    }

    function plural(qtd, singular, pluralTexto) {
        return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
    }

    // ---------------- CARREGAMENTO ----------------

    async function carregarPasseios() {
        const container = document.getElementById('lista-passeios');
        try {
            passeios = await AutorizacoesService.listarPorTurma(filho.turma_id);
            renderizarResumo();
            renderizarLista();
        } catch (erro) {
            console.error("Erro ao carregar os passeios:", erro);
            container.innerHTML = `<p class="painel-vazio">Erro ao carregar os passeios.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarResumo() {
        const total = passeios.length;
        const aguardando = passeios.filter(p => statusDe(p) === 'pendente' && !encerrado(p)).length;
        const respondidos = passeios.filter(p => statusDe(p) !== 'pendente').length;
        const porcentagem = total === 0 ? 100 : Math.round((respondidos / total) * 100);

        document.getElementById('resumo-passeios').innerHTML = `
            <div class="resumo-progresso">
                <div class="resumo-progresso-topo">
                    <div>
                        <strong>${aguardando === 0 ? "Nenhuma autorização pendente 🎉" : plural(aguardando, "autorização aguardando resposta", "autorizações aguardando resposta")}</strong>
                        <span>${respondidos} de ${total} respondidos</span>
                    </div>
                </div>
                <div class="barra-progresso"><div class="barra-progresso-preenchimento" style="width: ${porcentagem}%"></div></div>
            </div>
        `;
    }

    function renderizarLista() {
        const container = document.getElementById('lista-passeios');
        const busca = textoBusca.toLowerCase();

        const filtrados = passeios.filter(p => {
            if (filtroAtual !== 'todos' && statusDe(p) !== filtroAtual) return false;
            return !busca
                || (p.titulo || '').toLowerCase().includes(busca)
                || (p.local || '').toLowerCase().includes(busca);
        });

        if (filtrados.length === 0) {
            container.innerHTML = `<p class="painel-vazio">${passeios.length === 0
                ? "Nenhum passeio cadastrado para a turma."
                : "Nenhum passeio encontrado."}</p>`;
            return;
        }

        const ordem = ["Aguardando resposta", "Respondidos", "Encerrados"];
        const grupos = {};
        filtrados.forEach(p => (grupos[grupoDe(p)] = grupos[grupoDe(p)] || []).push(p));

        container.innerHTML = ordem.filter(g => grupos[g]).map(g => `
            <h4 class="titulo-grupo">${g}</h4>
            <div class="grade-comunicados">
                ${grupos[g].map(cartaoPasseio).join("")}
            </div>
        `).join("");

        container.querySelectorAll('.cartao-comunicado').forEach(cartao => {
            cartao.addEventListener("click", () => {
                abrirPasseio(passeios.find(p => p.id == cartao.dataset.id));
            });
        });
    }

    function cartaoPasseio(p) {
        const status = statusDe(p);
        const aguardando = status === 'pendente' && !encerrado(p);
        const rotulo = status === 'pendente' && encerrado(p) ? "Prazo encerrado" : ROTULOS[status];
        const data = p.data_evento ? `📅 ${formatarDiaMes(p.data_evento)}` : "📅 Data a definir";
        const prazo = prazoDe(p) ? ` · responder até ${formatarDiaMes(prazoDe(p))}` : "";

        return `
            <button class="cartao-comunicado ${aguardando ? 'nao-lido' : ''}" data-id="${p.id}">
                <div class="icone-comunicado ${COR_ICONE[status]}">
                    <span class="icone-mascara" style="--icone: url('../assets/icons/file-check.svg')"></span>
                </div>
                <div class="cartao-comunicado-info">
                    <div class="cartao-comunicado-topo">
                        <span class="badge-tipo badge-${status}">${rotulo}</span>
                    </div>
                    <p class="cartao-comunicado-titulo">${escaparHtml(p.titulo)}</p>
                    <p class="cartao-comunicado-texto">${escaparHtml(p.descricao || '')}</p>
                    <p class="item-atualizacao-meta">${data}${prazo}${p.local ? ' · 📍 ' + escaparHtml(p.local) : ''}</p>
                </div>
            </button>
        `;
    }

    // ---------------- MODAL E RESPOSTA ----------------

    function abrirPasseio(p) {
        if (!p) return;
        passeioAberto = p;
        const status = statusDe(p);
        const vencido = encerrado(p);

        document.getElementById('passeio-titulo').textContent = p.titulo;
        const badge = document.getElementById('passeio-status');
        badge.textContent = status === 'pendente' && vencido ? "Prazo encerrado" : ROTULOS[status];
        badge.className = `badge-tipo badge-${status}`;
        document.getElementById('passeio-data').textContent =
            `📅 ${p.data_evento ? formatarDiaMes(p.data_evento) : "Data a definir"}`;
        document.getElementById('passeio-prazo').textContent =
            `⏰ Responder até ${prazoDe(p) ? formatarDiaMes(prazoDe(p)) : "—"}`;
        document.getElementById('passeio-local').textContent = `📍 ${p.local || "Local não informado"}`;
        document.getElementById('passeio-aluno').textContent = `👤 ${filho.nome}`;
        document.getElementById('passeio-descricao').textContent = p.descricao || "";

        // depois do prazo (e sem resposta) não dá mais para responder
        document.getElementById('passeio-acoes').hidden = (status === 'pendente' && vencido);
        document.getElementById('modal-passeio').showModal();
    }

    async function responder(status) {
        if (!passeioAberto) return;
        try {
            await InicioResponsavelService.responderAutorizacao(passeioAberto.id, filho.id, status);
            document.getElementById('modal-passeio').close();
            mostrarAviso(status === 'autorizado' ? "Autorização registrada!" : "Resposta registrada.");
            await carregarPasseios();
        } catch (erro) {
            console.error("Erro ao responder passeio:", erro);
            mostrarAviso("Não foi possível registrar a resposta.");
        }
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.querySelectorAll('[data-fechar]').forEach(botao => {
        botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
    });
    document.getElementById('btn-autorizar').addEventListener("click", () => responder('autorizado'));
    document.getElementById('btn-recusar').addEventListener("click", () => responder('recusado'));

    document.getElementById('busca-passeios').addEventListener("input", (e) => {
        textoBusca = e.target.value.trim();
        renderizarLista();
    });

    document.querySelectorAll('#filtros-passeios .chip').forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll('#filtros-passeios .chip').forEach(c => c.classList.remove('ativo'));
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
        document.getElementById('subtitulo-passeios').textContent = "Nenhum aluno vinculado a este responsável.";
        document.getElementById('lista-passeios').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        return;
    }

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    carregarPasseios();
});
