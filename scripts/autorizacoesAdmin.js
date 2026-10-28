(function () {
    const listaContainer = document.getElementById("autorizacoes-lista");
    const detalheContainer = document.getElementById("autorizacao-detalhe");
    const subtitulo = document.getElementById("subtitulo-autorizacoes");

    const modal = document.getElementById("modal-autorizacao");
    const form = document.getElementById("form-autorizacao");
    const btnNova = document.getElementById("btn-nova-autorizacao");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const btnCancelar = document.getElementById("btn-cancelar");
    const modalTitulo = document.getElementById("modal-titulo");

    let idEditando = null; 
    async function carregarTurmasModal() {
        try {
            const turmas = await AutorizacoesService.listarTurmas();
            const container = document.getElementById("container-turmas-checkbox");
            
            let html = turmas.map(t => `
                <label class="checkbox-turma">
                    <input type="checkbox" value="${t.id}" class="check-turma">
                    ${t.nome}
                </label>
            `).join("");

            html += `
                <label class="checkbox-turma checkbox-todas">
                    <input type="checkbox" id="todas-turmas">
                    <strong>Todas as turmas</strong>
                </label>
            `;

            container.innerHTML = html;

            const checkTodas = document.getElementById("todas-turmas");
            const checkIndividuais = document.querySelectorAll(".check-turma");

            checkTodas.addEventListener("change", (e) => {
                checkIndividuais.forEach(c => c.checked = e.target.checked);
            });

            checkIndividuais.forEach(c => {
                c.addEventListener("change", () => {
                    const todosMarcados = Array.from(checkIndividuais).every(cb => cb.checked);
                    checkTodas.checked = todosMarcados;
                });
            });

        } catch (e) {
            console.error("Erro ao carregar turmas:", e);
        }
    }

    async function carregarLista() {
        try {
            const autorizacoes = await AutorizacoesService.listarTodasAdmin();
            
            if (subtitulo) {
                subtitulo.textContent = `${autorizacoes.length} autorizações · Todas as turmas`;
            }

            if (autorizacoes.length === 0) {
                listaContainer.innerHTML = "<p>Nenhuma autorização encontrada.</p>";
                detalheContainer.innerHTML = "<div class='detalhe-vazio'><p>Nenhum passeio cadastrado.</p></div>";
                return;
            }

            listaContainer.innerHTML = autorizacoes.map(aut => {
                const data = new Date(aut.data_evento + 'T12:00:00').toLocaleDateString('pt-BR');
                const statusClass = aut.status === 'aberto' ? 'aberto' : 'encerrado';

                return `
                    <div class="card-passeio" onclick="selecionarAutorizacao(${aut.id})" id="card-aut-${aut.id}">
                        <div class="card-passeio-topo">
                            <h3 class="card-passeio-titulo">${aut.titulo}</h3>
                            <span class="status-passeio ${statusClass}">${aut.status}</span>
                        </div>
                        <div class="card-passeio-turmas">
                            ${aut.turmas_nomes.map(t => `<span class="card-passeio-turma">${t}</span>`).join("")}
                        </div>
                        <p class="card-passeio-data">📅 ${data}</p>
                        <div class="card-passeio-stats">
                            <span class="stat-ok">${aut.total_ok} ✓</span>
                            <span class="stat-no">${aut.total_no} ✕</span>
                            <span class="stat-pendente">${aut.total_pendente} pendentes</span>
                        </div>
                    </div>
                `;
            }).join("");

            selecionarAutorizacao(autorizacoes[0].id);

        } catch (erro) {
            console.error("Erro ao carregar lista:", erro);
            listaContainer.innerHTML = "<p>Erro ao carregar.</p>";
        }
    }

    window.selecionarAutorizacao = async function(id) {
        document.querySelectorAll('.card-passeio').forEach(c => c.classList.remove('ativo'));
        document.getElementById(`card-aut-${id}`)?.classList.add('ativo');

        try {
            const { autorizacao, alunos } = await AutorizacoesService.detalharAutorizacao(id);
            const data = new Date(autorizacao.data_evento + 'T12:00:00').toLocaleDateString('pt-BR');
            
            let ok = alunos.filter(a => a.autorizacoes_respostas[0]?.status === 'autorizado').length;
            let no = alunos.filter(a => a.autorizacoes_respostas[0]?.status === 'recusado').length;
            let pendente = alunos.filter(a => !a.autorizacoes_respostas[0] || a.autorizacoes_respostas[0]?.status === 'pendente').length;
            let total = alunos.length;

            let porcentagem = total > 0 ? Math.round((ok / total) * 100) : 0;
            let porcentagemNo = total > 0 ? Math.round((no / total) * 100) : 0;

            detalheContainer.innerHTML = `
                <div class="detalhe-cabecalho" style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 class="detalhe-titulo">${autorizacao.titulo}</h3>
                        <div class="detalhe-meta">
                            <span>📅 ${data}</span>
                            <span>👥 ${total} alunos</span>
                            <span>📍 ${autorizacao.local || 'Local não informado'}</span>
                        </div>
                    </div>
                    <div class="menu-container">
                        <button class="btn-opcoes" onclick="event.stopPropagation(); toggleMenu(this)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="menu-dropdown">
                            <button onclick="event.stopPropagation(); prepararEdicaoAutorizacao(${autorizacao.id})">✏️ Editar</button>
                            <button class="excluir" onclick="event.stopPropagation(); excluirAutorizacao(${autorizacao.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>

                <p class="detalhe-descricao">${autorizacao.descricao}</p>

                <div class="detalhe-stats">
                    <div class="stat-card verde">
                        <strong>${ok}</strong>
                        <span>Autorizados</span>
                    </div>
                    <div class="stat-card vermelho">
                        <strong>${no}</strong>
                        <span>Recusados</span>
                    </div>
                    <div class="stat-card laranja">
                        <strong>${pendente}</strong>
                        <span>Pendentes</span>
                    </div>
                </div>

                <div class="barra-progresso">
                    <div class="verde" style="width: ${porcentagem}%"></div>
                    <div class="vermelho" style="width: ${porcentagemNo}%"></div>
                </div>
                <p class="progresso-legenda">${porcentagem}% autorizado</p>

                <h4 class="detalhe-pais-titulo">Resposta dos pais</h4>
                <div class="lista-pais">
                    ${alunos.map(aluno => {
                        const statusReal = aluno.autorizacoes_respostas[0]?.status || 'pendente';
                        const classe = statusReal === 'autorizado' ? 'autorizado' : (statusReal === 'recusado' ? 'recusado' : 'pendente');
                        return `
                            <div class="linha-pai">
                                <span class="linha-pai-nome">${aluno.nome}</span>
                                <span class="status-pai ${classe}">${statusReal}</span>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;

        } catch (erro) {
            console.error("Erro ao carregar detalhes:", erro);
            detalheContainer.innerHTML = "<p>Erro ao carregar detalhes.</p>";
        }
    }

    // AÇÕES DO MODAL 
    btnNova?.addEventListener("click", async () => {
        idEditando = null;
        form.reset();
        modalTitulo.textContent = "Nova Autorização";
        await carregarTurmasModal();
        modal.showModal();
    });

    btnFecharModal?.addEventListener("click", () => modal.close());
    btnCancelar?.addEventListener("click", () => modal.close());

    window.prepararEdicaoAutorizacao = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        idEditando = id;
        form.reset();
        modalTitulo.textContent = "Editar Autorização";
        
        await carregarTurmasModal();

        const { autorizacao } = await AutorizacoesService.detalharAutorizacao(id);
        const turmasAtuais = await AutorizacoesService.buscarTurmasDaAutorizacao(id);

        document.getElementById("evento-nome").value = autorizacao.titulo;
        document.getElementById("evento-descricao").value = autorizacao.descricao;
        document.getElementById("evento-data").value = autorizacao.data_evento;
        document.getElementById("evento-prazo").value = autorizacao.prazo_limite;
        document.getElementById("evento-local").value = autorizacao.local || '';

        const checkboxes = document.querySelectorAll(".check-turma");
        checkboxes.forEach(cb => {
            if (turmasAtuais.includes(Number(cb.value))) {
                cb.checked = true;
            }
        });

        modal.showModal();
    }

    window.excluirAutorizacao = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        if (!confirm("Tem certeza que deseja excluir esta autorização? As respostas dos pais também serão apagadas.")) return;
        try {
            await AutorizacoesService.excluir(id);
            carregarLista();
            detalheContainer.innerHTML = "<div class='detalhe-vazio'><p>Selecione uma autorização.</p></div>";
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Erro ao excluir.");
        }
    }

    window.toggleMenu = function(botao) {
        const menu = botao.nextElementSibling;
        document.querySelectorAll('.menu-dropdown').forEach(m => { if (m !== menu) m.classList.remove('aberto'); });
        menu.classList.toggle('aberto');
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-container')) {
            document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        }
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("evento-nome").value;
        const desc = document.getElementById("evento-descricao").value;
        const dataEv = document.getElementById("evento-data").value;
        const prazo = document.getElementById("evento-prazo").value;
        const local = document.getElementById("evento-local").value;

        const turmasMarcadas = Array.from(document.querySelectorAll(".check-turma:checked")).map(cb => cb.value);

        if (turmasMarcadas.length === 0) {
            alert("Por favor, selecione pelo menos uma turma.");
            return;
        }

        const dados = {
            titulo: nome,
            descricao: desc,
            data_evento: dataEv,
            prazo_limite: prazo,
            local: local,
            status: 'aberto'
        };

        try {
            if (idEditando) {
                await AutorizacoesService.atualizar(idEditando, dados, turmasMarcadas);
            } else {
                await AutorizacoesService.criar(dados, turmasMarcadas);
            }
            modal.close();
            carregarLista();
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro ao salvar autorização.");
        }
    });

    carregarLista();
})();