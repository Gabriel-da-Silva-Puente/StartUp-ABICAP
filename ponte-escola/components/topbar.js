function renderizarBarraTopo(prefixo = "") {

    const topbar = document.querySelector(".barra-topo");
    if (!topbar) return;
    
    const usuario = {
        id: 1,
        nome: "Ana Carolina Mendes",
        iniciais: "AC",
        perfil: "professor",
        turma: "Jardim II — Turma A",
        alunos: 22
    };

    // const usuario = UsuarioServico.obter();

    topbar.innerHTML = `
        <div class="topo-esquerda">
            <h1 class="topo-nome">${usuario.nome}</h1>
        </div>

        <div class="topo-direita">

            <div class="topo-turma-seletor" id="topo-turma-seletor">
                <button class="topo-turma-botao" id="btn-trocar-turma">
                    <span class="topo-turma-atual">${usuario.turma}</span>
                    <svg class="topo-turma-seta" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="topo-turma-menu" id="topo-turma-menu" hidden>
                    <button class="topo-turma-opcao" data-turma="Jardim II — Turma A">
                        Jardim II — Turma A
                        <span class="topo-turma-alunos">22 alunos</span>
                    </button>
                    <button class="topo-turma-opcao" data-turma="Jardim II — Turma B">
                        Jardim II — Turma B
                        <span class="topo-turma-alunos">20 alunos</span>
                    </button>
                    <button class="topo-turma-opcao" data-turma="Jardim I — Turma A">
                        Jardim I — Turma A
                        <span class="topo-turma-alunos">18 alunos</span>
                    </button>
                    <button class="topo-turma-opcao" data-turma="5º Ano — Turma A">
                        5º Ano — Turma A
                        <span class="topo-turma-alunos">25 alunos</span>
                    </button>
                </div>
            </div>

            <button class="topo-notificacao" id="btn-notificacoes" aria-label="Notificações">
                <img src="${prefixo}assets/icons/bell.svg" alt="" class="topo-icone">
                <span class="topo-badge">3</span>
            </button>

            <button class="topo-avatar" id="btn-perfil-topo">
                ${usuario.iniciais || "AC"}
            </button>

        </div>
    `;

    
    const btnTurma = document.getElementById("btn-trocar-turma");
    const menuTurma = document.getElementById("topo-turma-menu");

    btnTurma?.addEventListener("click", () => {
        menuTurma.hidden = !menuTurma.hidden;
    });

    
    document.querySelectorAll(".topo-turma-opcao").forEach(opcao => {
        opcao.addEventListener("click", () => {
            const turma = opcao.dataset.turma;
            document.querySelector(".topo-turma-atual").textContent = turma;
            menuTurma.hidden = true;
            mostrarAviso(`Turma alterada para: ${turma}`);
        });
    });

  
    document.addEventListener("click", (evento) => {
        if (
            !btnTurma?.contains(evento.target) &&
            !menuTurma?.contains(evento.target)
        ) {
            menuTurma.hidden = true;
        }
    });

  
    document.getElementById("btn-notificacoes")?.addEventListener("click", () => {
        mostrarAviso("Você tem 3 novas notificações.");
    });


    document.getElementById("btn-perfil-topo")?.addEventListener("click", () => {
        mostrarAviso("Perfil da professora Ana Carolina.");
    });
}