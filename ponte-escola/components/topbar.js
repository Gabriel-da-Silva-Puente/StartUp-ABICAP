async function renderizarBarraTopo(prefixo = "") {
    const topbar = document.querySelector(".barra-topo");
    if (!topbar) return;

    // Pega o ID salvo no navegador
    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) {
        window.location.href = prefixo + "index.html";
        return;
    }

    // Busca os dados no banco
    let usuario = null;
    try {
        usuario = await AdministradorService.buscarPerfilCompleto(idLogado);
    } catch (erro) {
        console.error("Erro na requisição:", erro);
    }

    // Se usuario nao existe, volta para login
    if (!usuario) {
        console.warn("Usuário não encontrado no banco. Voltando para o login.");
        localStorage.removeItem('usuarioLogadoId');
        localStorage.removeItem('usuarioLogadoTipo');
        window.location.href = prefixo + "index.html";
        return;
    }

    // Salva o nome do usuário no navegador para outras páginas usarem
    localStorage.setItem('usuarioLogadoNome', usuario.nome);

    //  Gerador de Iniciais para foto de miniperfil
    const partesNome = usuario.nome.trim().split(" ");
    const iniciais = partesNome.length > 1 
        ? (partesNome[0][0] + partesNome[partesNome.length - 1][0]).toUpperCase()
        : partesNome[0][0].toUpperCase();

    // Seletor de turmas
    let seletorTurmasHTML = "";
    
    const temTurmas = usuario.professores_turmas && usuario.professores_turmas.length > 0;
    
    if (usuario.tipo === 'professor' && temTurmas) {
        const turmaSalvaId = localStorage.getItem('turmaVisualizadaId');
        let turmaAtual = usuario.professores_turmas[0].turma;
        
        if (turmaSalvaId) {
            const achou = usuario.professores_turmas.find(t => t.turma.id == turmaSalvaId);
            if (achou) turmaAtual = achou.turma;
        }

        // Salva a turma atual no navegador para as outras páginas usarem
        localStorage.setItem('turmaVisualizadaId', turmaAtual.id);
        localStorage.setItem('turmaVisualizadaNome', turmaAtual.nome);

        const opcoes = usuario.professores_turmas.map(t => 
            `<button class="topo-turma-opcao" data-id="${t.turma.id}" data-nome="${t.turma.nome}">
                ${t.turma.nome}
            </button>`
        ).join("");

        seletorTurmasHTML = `
            <div class="topo-turma-seletor">
                <button class="topo-turma-botao" id="btn-trocar-turma">
                    <span class="topo-turma-atual">${turmaAtual.nome}</span>
                    <svg class="topo-turma-seta" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="topo-turma-menu" id="topo-turma-menu" hidden>
                    ${opcoes}
                </div>
            </div>
        `;
    }

    
    topbar.innerHTML = `
        <div class="topo-esquerda">
            <h1 class="topo-nome">${usuario.nome}</h1>
        </div>

        <div class="topo-direita">
            ${seletorTurmasHTML}

            <button class="topo-notificacao" id="btn-notificacoes">
                <img src="${prefixo}assets/icons/bell.svg" alt="" class="topo-icone">
                <span class="topo-badge">3</span>
            </button>

            <a href="${prefixo}pages/perfil.html" class="topo-avatar">
                ${iniciais}
            </a>
        </div>
    `;

   
    const btnTrocar = document.getElementById("btn-trocar-turma");
    const menuTurma = document.getElementById("topo-turma-menu");

    if (btnTrocar && menuTurma) {
        btnTrocar.addEventListener("click", () => {
            menuTurma.hidden = !menuTurma.hidden;
        });

        document.querySelectorAll(".topo-turma-opcao").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const nome = btn.dataset.nome;
                
                document.querySelector(".topo-turma-atual").textContent = nome;
                localStorage.setItem('turmaVisualizadaId', id);
                localStorage.setItem('turmaVisualizadaNome', nome);
                

                window.location.reload(); 
            });
        });

        
        document.addEventListener("click", (e) => {
            if (!btnTrocar.contains(e.target) && !menuTurma.contains(e.target)) {
                menuTurma.hidden = true;
            }
        });
    }
}