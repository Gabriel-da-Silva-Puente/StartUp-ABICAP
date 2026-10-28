async function renderizarBarraTopoAdministrador(prefixo = "") {

    const topbar = document.querySelector(".barra-topo");
    if (!topbar) return;

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) {
        window.location.href = prefixo + "index.html";
        return;
    }

    let usuario = null;
    try {
        usuario = await AdministradorService.buscarPerfilCompleto(idLogado);
    } catch (erro) {
        console.error("Erro ao buscar usuário admin:", erro);
    }

    if (!usuario) {
        topbar.innerHTML = `<div style="padding: 1rem; color: red;">Erro ao carregar perfil</div>`;
        return;
    }

    const partesNome = usuario.nome.trim().split(" ");
    const iniciais = partesNome.length > 1 
        ? (partesNome[0][0] + partesNome[partesNome.length - 1][0]).toUpperCase()
        : partesNome[0][0].toUpperCase();

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
                ${iniciais}
            </a>

        </div>
    `;

    document.getElementById("btn-notificacoes")?.addEventListener("click", () => {
        mostrarAviso("Você tem 3 novas notificações.");
    });
}