// BARRA DE NAVEGAÇÃO DO RESPONSÁVEL (fica no topo, no lugar da barra lateral)
async function renderizarBarraTopoResponsavel(paginaAtual, prefixo = "") {

    const barra = document.querySelector(".barra-topo-responsavel");
    if (!barra) return;

    // Pega o ID salvo no navegador
    const idLogado = localStorage.getItem('usuarioLogadoId');
    const tipoLogado = localStorage.getItem('usuarioLogadoTipo');
    if (!idLogado || tipoLogado !== 'responsavel') {
        window.location.href = prefixo + "index.html";
        return;
    }

    // Busca os dados no banco
    let responsavel = null;
    try {
        responsavel = await ResponsavelService.buscarPerfilCompleto(idLogado);
    } catch (erro) {
        console.error("Erro ao buscar responsável:", erro);
    }

    // Se o responsável não existe, volta para o login
    if (!responsavel) {
        console.warn("Responsável não encontrado no banco. Voltando para o login.");
        localStorage.removeItem('usuarioLogadoId');
        localStorage.removeItem('usuarioLogadoTipo');
        window.location.href = prefixo + "index.html";
        return;
    }

    const nome = responsavel.nome || responsavel.Nome || "Responsável";
    localStorage.setItem('usuarioLogadoNome', nome);

    // Gerador de iniciais para o miniperfil
    const partesNome = nome.trim().split(" ");
    const iniciais = partesNome.length > 1
        ? (partesNome[0][0] + partesNome[partesNome.length - 1][0]).toUpperCase()
        : partesNome[0][0].toUpperCase();

    const itensMenu = [
        { chave: "inicio",      texto: "Início",      pagina: "responsavel-inicio.html" },
        { chave: "comunicados", texto: "Comunicados", pagina: "responsavel-comunicados.html" },
        { chave: "calendario",  texto: "Calendário",  pagina: "responsavel-calendario.html" },
        { chave: "cardapio",    texto: "Cardápio",    pagina: "responsavel-cardapio.html" },
        { chave: "mural",       texto: "Mural",       pagina: "responsavel-mural.html" }
    ];

    const linksHTML = itensMenu.map(item => `
        <a href="${prefixo}pages/${item.pagina}" class="${paginaAtual === item.chave ? "ativo" : ""}">${item.texto}</a>
    `).join("");

    barra.innerHTML = `
        <div class="topo-responsavel-conteudo">

            <a href="${prefixo}pages/responsavel-inicio.html" class="topo-responsavel-marca">
                <span class="topo-responsavel-logo">PE</span>
                <span>PonteEscola</span>
            </a>

            <nav class="topo-responsavel-menu">
                ${linksHTML}
            </nav>

            <div class="topo-direita">

                <button class="topo-notificacao" id="btn-notificacoes" aria-label="Notificações">
                    <img src="${prefixo}assets/icons/bell.svg" alt="" class="topo-icone">
                    <span class="topo-ponto" id="topo-ponto-notificacao" hidden></span>
                </button>

                <div class="topo-usuario">
                    <button class="topo-usuario-botao" id="btn-usuario">
                        <span class="topo-usuario-avatar">${iniciais}</span>
                        <span class="topo-usuario-texto">
                            <strong>${escaparHtml(nome)}</strong>
                            <small>Responsável</small>
                        </span>
                        <img src="${prefixo}assets/icons/chevron-down.svg" alt="" class="topo-usuario-seta">
                    </button>

                    <div class="topo-usuario-menu" id="topo-usuario-menu" hidden>
                        <button id="btn-sair">
                            <img src="${prefixo}assets/icons/log-out.svg" alt="" class="topo-icone">
                            <span>Sair</span>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    `;

    const btnUsuario = document.getElementById("btn-usuario");
    const menuUsuario = document.getElementById("topo-usuario-menu");

    btnUsuario.addEventListener("click", () => {
        menuUsuario.hidden = !menuUsuario.hidden;
    });

    document.addEventListener("click", (e) => {
        if (!btnUsuario.contains(e.target) && !menuUsuario.contains(e.target)) {
            menuUsuario.hidden = true;
        }
    });

    document.getElementById("btn-sair").addEventListener("click", () => {
        window.location.href = `${prefixo}index.html`;
    });

    // Avisa as páginas que a barra já está na tela
    document.dispatchEvent(new Event("barraTopoResponsavelPronta"));
}

// DEVOLVE O FILHO SELECIONADO (O ÚLTIMO ESCOLHIDO OU O PRIMEIRO DA LISTA) E SALVA NO NAVEGADOR
async function obterFilhoSelecionado(responsavelId) {
    const filhos = await ResponsavelService.listarFilhos(responsavelId);
    if (filhos.length === 0) return { filho: null, filhos };

    const filhoSalvoId = localStorage.getItem('alunoVisualizadoId');
    const filho = filhos.find(f => f.id == filhoSalvoId) || filhos[0];

    // Salva para as outras páginas usarem (turmaVisualizadaId é o mesmo nome usado pelo professor)
    localStorage.setItem('alunoVisualizadoId', filho.id);
    localStorage.setItem('alunoVisualizadoNome', filho.nome);
    localStorage.setItem('turmaVisualizadaId', filho.turma_id);
    localStorage.setItem('turmaVisualizadaNome', filho.turma?.nome || "");

    return { filho, filhos };
}

// DESENHA O CARTÃO DO FILHO (COM TROCA DE FILHO QUANDO HÁ MAIS DE UM)
function renderizarSeletorFilho(container, filho, filhos, prefixo = "") {
    if (!container || !filho) return;

    const partesNome = filho.nome.trim().split(" ");
    const iniciais = partesNome.length > 1
        ? (partesNome[0][0] + partesNome[partesNome.length - 1][0]).toUpperCase()
        : partesNome[0][0].toUpperCase();

    const temVarios = filhos.length > 1;

    const opcoes = filhos.map(f => `
        <button class="seletor-filho-opcao" data-id="${f.id}">
            ${escaparHtml(f.nome)}
            <span>${escaparHtml(f.turma?.nome || "")}</span>
        </button>
    `).join("");

    container.innerHTML = `
        <button class="seletor-filho-botao" id="btn-trocar-filho" ${temVarios ? "" : "disabled"}>
            <span class="seletor-filho-avatar">${iniciais}</span>
            <span class="seletor-filho-texto">
                <strong>${escaparHtml(filho.nome)}</strong>
                <small>${escaparHtml(filho.turma?.nome || "Sem turma")}</small>
            </span>
            ${temVarios ? `<img src="${prefixo}assets/icons/chevron-right.svg" alt="" class="seletor-filho-seta">` : ""}
        </button>

        <div class="seletor-filho-menu" id="seletor-filho-menu" hidden>
            ${opcoes}
        </div>
    `;

    if (!temVarios) return;

    const btnTrocar = document.getElementById("btn-trocar-filho");
    const menuFilho = document.getElementById("seletor-filho-menu");

    btnTrocar.addEventListener("click", () => {
        menuFilho.hidden = !menuFilho.hidden;
    });

    document.querySelectorAll(".seletor-filho-opcao").forEach(btn => {
        btn.addEventListener("click", () => {
            localStorage.setItem('alunoVisualizadoId', btn.dataset.id);
            window.location.reload();
        });
    });

    document.addEventListener("click", (e) => {
        if (!btnTrocar.contains(e.target) && !menuFilho.contains(e.target)) {
            menuFilho.hidden = true;
        }
    });
}

window.renderizarBarraTopoResponsavel = renderizarBarraTopoResponsavel;
window.obterFilhoSelecionado = obterFilhoSelecionado;
window.renderizarSeletorFilho = renderizarSeletorFilho;
