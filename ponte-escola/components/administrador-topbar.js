function renderizarBarraTopoAdministrador(prefixo = "") {

    const topbar = document.querySelector(".barra-topo");
    if (!topbar) return;

    const usuario = {
        id: 1,
        nome: "Ricardo Nunes",
        iniciais: "RN",
        perfil: "administrador"
    };

    // const usuario = UsuariosServico.usuarioAtual();

    topbar.innerHTML = `
        <div class="topo-esquerda">
            <p class="topo-sobrescrito">Área da administração</p>
            <h1 class="topo-nome">${usuario.nome}</h1>
        </div>

        <div class="topo-direita">

            <button class="topo-notificacao" id="btn-notificacoes" aria-label="Notificações">
                <img src="${prefixo}assets/icons/bell.svg" alt="" class="topo-icone">
                <span class="topo-badge">3</span>
            </button>

            <a href="${prefixo}pages/perfil.html" class="topo-avatar" id="btn-perfil-topo">
                ${usuario.iniciais || "AD"}
            </a>

        </div>
    `;

    document.getElementById("btn-notificacoes")?.addEventListener("click", () => {
        mostrarAviso("Você tem 3 novas notificações.");
    });
}