function renderizarBarraLateralAdministrador(paginaAtual, prefixo = "") {

    const barra = document.querySelector(".barra-lateral");
    if (!barra) return;

    barra.innerHTML = `
        <div class="lateral-marca">PonteEscola</div>

        <nav class="lateral-menu">

            <a href="${prefixo}pages/administrador-inicio.html" class="${paginaAtual === "administrador" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/home.svg" alt="" class="lateral-icone">
                <span>Inicio</span>
            </a>

            <a href="${prefixo}pages/administrador-turmas.html" class="${paginaAtual === "administrador-turmas" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/users.svg" alt="" class="lateral-icone">
                <span>Turmas</span>
            </a>

            <a href="${prefixo}pages/administrador-avisos.html" class="${paginaAtual === "administrador-avisos" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/megaphone.svg" alt="" class="lateral-icone">
                <span>Avisos</span>
            </a>

            <a href="${prefixo}pages/administrador-ocorrencias.html" class="${paginaAtual === "administrador-ocorrencias" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/triangle-alert.svg" alt="" class="lateral-icone">
                <span>Ocorrências</span>
            </a>

            <a href="${prefixo}pages/administrador-autorizacoes.html" class="${paginaAtual === "administrador-autorizacoes" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/file-check.svg" alt="" class="lateral-icone">
                <span>Autorizações</span>
            </a>


            <a href="${prefixo}pages/administrador-mensagens.html" class="${paginaAtual === "administrador-mensagens" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/mail.svg" alt="" class="lateral-icone">
                <span>Mensagens</span>
            </a>

            <a href="${prefixo}pages/administrador-cardapio.html" class="${paginaAtual === "administrador-cardapio" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/cooking-pot.svg" alt="" class="lateral-icone">
                <span>Cardápio</span>
            </a>

            <a href="${prefixo}pages/administrador-calendario.html" class="${paginaAtual === "administrador-calendario" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/calendar-days.svg" alt="" class="lateral-icone">
                <span>Calendário</span>
            </a>



            <a href="${prefixo}pages/administrador-duvidas.html" class="${paginaAtual === "administrador-duvidas" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/circle-question-mark.svg" alt="" class="lateral-icone">
                <span>Central de Dúvidas</span>
            </a>

        </nav>

        <div class="lateral-rodape">
            <a href="${prefixo}pages/administrador-perfil.html" class="${paginaAtual === "perfil" ? "ativo" : ""}">
                <img src="${prefixo}assets/icons/users.svg" alt="" class="lateral-icone">
                <span>Perfil</span>
            </a>
            <button id="btn-sair">
                <img src="${prefixo}assets/icons/log-out.svg" alt="" class="lateral-icone">
                <span>Sair</span>
            </button>
        </div>
    `;

    document.getElementById("btn-sair")?.addEventListener("click", () => {
        window.location.href = `${prefixo}index.html`;
    });
}