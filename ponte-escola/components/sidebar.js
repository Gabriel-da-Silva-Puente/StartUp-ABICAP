function renderizarBarraLateral(paginaAtual, prefixo = "") {

    const barra = document.querySelector(".barra-lateral");
    if (!barra) return;

    barra.innerHTML = `
        <div class="lateral-marca">PonteEscola</div>

        <nav class="lateral-menu">

            <a href="${prefixo}pages/inicio.html" class="${paginaAtual === "inicio" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/home.svg" alt="" class="lateral-icone">
                <span>Início</span>
            </a>

            <a href="${prefixo}pages/atividades.html" class="${paginaAtual === "atividades" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/clipboard-list.svg" alt="" class="lateral-icone">
                <span>Atividades</span>
            </a>

            <a href="${prefixo}pages/avisos.html" class="${paginaAtual === "avisos" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/megaphone.svg" alt="" class="lateral-icone">
                <span>Avisos</span>
            </a>

            <a href="${prefixo}pages/ocorrencias.html" class="${paginaAtual === "ocorrencias" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/triangle-alert.svg" alt="" class="lateral-icone">
                <span>Ocorrências</span>
            </a>

            <a href="${prefixo}pages/autorizacoes.html" class="${paginaAtual === "autorizacoes" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/file-check.svg" alt="" class="lateral-icone">
                <span>Autorizações</span>
            </a>

            <a href="${prefixo}pages/mural.html" class="${paginaAtual === "mural" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/image.svg" alt="" class="lateral-icone">
                <span>Mural da Turma</span>
            </a>

        </nav>

        <div class="lateral-rodape">
            <button id="btn-perfil">
                <img src="${prefixo}assets/icons/users.svg" alt="" class="lateral-icone">
                <span>Perfil</span>
            </button>
            <button id="btn-sair" onclick="window.location.href='/index.html'">
                <img src="${prefixo}assets/icons/log-out.svg" alt="" class="lateral-icone">
                <span>Sair</span>
            </button>
        </div>
    `;


}