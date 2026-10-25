(function () {
    const modal = document.getElementById("modal-aviso");
    const btnNovo = document.getElementById("btn-novo-aviso");
    const btnCancelar = document.getElementById("btn-cancelar-aviso");
    const form = document.getElementById("form-aviso");
    const btnFechar = document.getElementById("btn-fechar-modal");
    const selectTurma = document.getElementById("aviso-turma"); 
    
    const botoesCategoria = document.querySelectorAll(".btn-categoria");
    const inputTipo = document.getElementById("aviso-tipo");

    // VARIÁVEIS DE FILTRO E BUSCA
    const inputBusca = document.getElementById("busca-avisos");
    const botoesFiltro = document.querySelectorAll(".filtros-avisos button");
    
    // VARIÁVEIS DO NOVO MODAL DE DETALHES
    const modalDetalhe = document.getElementById("modal-detalhe-aviso");
    const btnFecharDetalhe = document.getElementById("btn-fechar-detalhe");
    const btnVerTodos = document.getElementById("btn-ver-todos");
    
    let filtroAtual = 'todos';
    let termoBuscaAtual = '';

    // CARREGA AS TURMAS NO SELECT 
    async function carregarTurmasSelect() {
        const autorId = localStorage.getItem('usuarioLogadoId');
        if (!autorId || !selectTurma) return;

        try {
            const turmas = await AvisosService.buscarTurmasDoProfessor(autorId);
            
            selectTurma.innerHTML = '';

            if (turmas.length === 0) {
                selectTurma.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
                return;
            }

            turmas.forEach(item => {
                const option = document.createElement("option");
                option.value = item.turma.id; 
                option.textContent = item.turma.nome; 
                selectTurma.appendChild(option);
            });

        } catch (erro) {
            console.error("Erro ao carregar turmas:", erro);
            selectTurma.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    carregarTurmasSelect();

    // LÓGICA DO MODAL DE CRIAR
    btnNovo?.addEventListener("click", () => {
        form.reset(); 
        carregarTurmasSelect(); 

        botoesCategoria.forEach(b => b.classList.remove("ativo"));
        document.querySelector('.btn-categoria[data-valor="comunicado"]').classList.add("ativo");
        inputTipo.value = "comunicado"; 
        
        modal.showModal();
    });

    btnCancelar?.addEventListener("click", () => modal.close());
    btnFechar?.addEventListener("click", () => modal.close());

    botoesCategoria.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesCategoria.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            inputTipo.value = botao.dataset.valor;
        });
    });

    // LÓGICA DE SALVAR NO BANCO 
    form?.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const titulo = document.getElementById("aviso-titulo").value;
        const descricao = document.getElementById("aviso-mensagem").value;
        const tipo = inputTipo.value; 
        const turmaId = document.getElementById("aviso-turma").value; 
        const autorId = localStorage.getItem('usuarioLogadoId'); 
        const dataEvento = document.getElementById("aviso-data").value; 

        if (!turmaId) {
            alert("Por favor, selecione uma turma.");
            return;
        }

        try {
            await AvisosService.criar(titulo, descricao, tipo, turmaId, autorId, dataEvento);
            
            alert("Aviso publicado com sucesso!");
            modal.close();
            form.reset();
            
            carregarEstatisticas();
            carregarAvisosNaTela();

        } catch (erro) {
            console.error("Erro ao publicar:", erro);
            alert("Erro ao publicar o aviso. Verifique o console.");
        }
    });

    // LÓGICA DOS FILTROS DE CATEGORIA
    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesFiltro.forEach(b => {
                b.classList.remove("ativo");
                b.setAttribute("aria-pressed", "false");
            });
            
            botao.classList.add("ativo");
            botao.setAttribute("aria-pressed", "true");
            filtroAtual = botao.dataset.filtro || botao.textContent.trim().toLowerCase(); 
            
            carregarAvisosNaTela();
        });
    });

    // LÓGICA DA BARRA DE BUSCA 
    inputBusca?.addEventListener("input", (e) => {
        termoBuscaAtual = e.target.value;
        carregarAvisosNaTela(); 
    });

    // PREENCHE OS CARDS DE ESTATÍSTICA
    async function carregarEstatisticas() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) return;

        try {
            const stats = await AvisosService.obterEstatisticas(turmaId);
            
            const elTotal = document.getElementById("stat-total-avisos");
            const elAguardando = document.getElementById("stat-aguardando");
            const elConfirmados = document.getElementById("stat-confirmados");

            if (elTotal) elTotal.textContent = stats.total;
            if (elAguardando) elAguardando.textContent = stats.aguardando;
            if (elConfirmados) elConfirmados.textContent = stats.confirmados;

        } catch (erro) {
            console.error("Erro ao carregar estatísticas:", erro);
        }
    }

    // CARREGA OS AVISOS NA TELA 
    async function carregarAvisosNaTela() {
        const container = document.getElementById("lista-avisos");
        if (!container) return;

        const turmaId = localStorage.getItem('turmaVisualizadaId');

        if (!turmaId) {
            container.innerHTML = "<p>Nenhuma turma selecionada.</p>";
            return;
        }

        try {
            const { avisos, totalAlunos } = await AvisosService.listarPorTurma(
                turmaId, 
                filtroAtual, 
                termoBuscaAtual
            );

            // ATUALIZA O SUBTÍTULO COM O NOME E A QUANTIDADE
            const subtitulo = document.getElementById("subtitulo-avisos-turma");
            if (subtitulo) {
                
                const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Jardim II — Turma A";
                subtitulo.textContent = `${avisos.length} avisos · ${turmaNome}`;
            }

            if (avisos.length === 0) {
                container.innerHTML = "<p>Nenhum aviso encontrado com esses filtros.</p>";
                return;
            }

            container.innerHTML = avisos.map(aviso => {
                
                const qtdLeituras = aviso.avisos_lidos[0]?.count || 0;
                const todosLeram = qtdLeituras >= totalAlunos && totalAlunos > 0;
                
                const classeCor = todosLeram ? "status-verde" : "status-laranja";
                const icone = todosLeram 
                    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
                    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

                return `
                    <!-- ONCLICK ADICIONADO PARA ABRIR O MODAL DE DETALHES -->
                    <div class="card-aviso" 
                         onclick="abrirDetalheAviso('${aviso.id}', '${aviso.titulo.replace(/'/g, "\\'")}', '${aviso.descricao.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', '${aviso.created_at}', '${aviso.tipo}', ${qtdLeituras}, ${totalAlunos})"
                         style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #eee;">
                        
                        <div class="aviso-info">
                            <span class="badge-tipo badge-${aviso.tipo.toLowerCase()}">${aviso.tipo}</span>
                            <h3 style="margin: 0.5rem 0; font-size: 1.1rem; color: #333;">${aviso.titulo}</h3>
                            <span style="font-size: 0.8125rem; color: #888;">${new Date(aviso.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <div class="aviso-status ${classeCor}" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 1.1rem;">
                                ${icone}
                                ${qtdLeituras}/${totalAlunos}
                            </div>
                            <span style="font-size: 0.75rem; color: #888;">leituras</span>
                        </div>

                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar avisos:", erro);
            container.innerHTML = "<p>Erro ao carregar a lista de avisos.</p>";
        }
    }

    // EVENTOS DO MODAL DE DETALHES
    btnFecharDetalhe?.addEventListener("click", () => modalDetalhe.close());
    btnVerTodos?.addEventListener("click", () => modalDetalhe.close());
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.close();
    });

    // CHAMADA INICIAL DA PÁGINA
    carregarEstatisticas();
    carregarAvisosNaTela();

})();

// FUNÇÃO GLOBAL PARA ABRIR O MODAL DE DETALHES 
window.abrirDetalheAviso = function(id, titulo, descricao, dataCriacao, tipo, lidos, total) {
    const modal = document.getElementById("modal-detalhe-aviso");
    
    
    document.getElementById("detalhe-titulo").textContent = titulo;
    
    
    document.getElementById("detalhe-descricao").textContent = descricao.replace(/\\n/g, '\n');
    
    const dataFormatada = new Date(dataCriacao).toLocaleDateString('pt-BR');
    document.getElementById("detalhe-data").textContent = dataFormatada;
    
    
    document.getElementById("detalhe-turma").textContent = localStorage.getItem('turmaVisualizadaNome') || "Turma";

    
    const badge = document.getElementById("detalhe-tipo");
    badge.textContent = tipo;
    badge.className = `badge-tipo badge-${tipo.toLowerCase()}`;

    
    const porcentagem = total > 0 ? (lidos / total) * 100 : 0;
    const faltam = total - lidos;
    
   
    const barra = document.getElementById("detalhe-barra");
    barra.style.width = `${porcentagem}%`;

    
    const statusTexto = document.getElementById("detalhe-status-texto");
    statusTexto.innerHTML = `${lidos}/${total} <span>${porcentagem >= 100 ? '✓' : '⏱'}</span>`;
    
    
    if (porcentagem >= 100) {
        barra.style.background = 'var(--color-success)';
        statusTexto.className = 'progresso-texto completo';
        document.getElementById("detalhe-faltam").textContent = "Todos os responsáveis leram!";
    } else {
        barra.style.background = 'var(--color-success)'; // Fica 
        statusTexto.className = 'progresso-texto';
        document.getElementById("detalhe-faltam").textContent = `${faltam} responsáveis ainda não leram`;
    }

    // Abre o modal
    modal.showModal();
}