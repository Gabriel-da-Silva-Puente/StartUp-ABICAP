(function () {
    const modal = document.getElementById("modal-aviso");
    const btnNovo = document.getElementById("btn-novo-aviso");
    const btnCancelar = document.getElementById("btn-cancelar-aviso");
    const form = document.getElementById("form-aviso");
    const btnFechar = document.getElementById("btn-fechar-modal");
    const selectTurma = document.getElementById("aviso-turma"); 
    
    const botoesCategoria = document.querySelectorAll(".btn-categoria");
    const inputTipo = document.getElementById("aviso-tipo");
    const campoDataEvento = document.getElementById("campo-data-evento"); 
    const inputData = document.getElementById("aviso-data"); 

    // VARIÁVEIS DE FILTRO E BUSCA
    const inputBusca = document.getElementById("busca-avisos");
    const botoesFiltro = document.querySelectorAll(".filtros-avisos button");
    
    // VARIÁVEIS DO NOVO MODAL DE DETALHES
    const modalDetalhe = document.getElementById("modal-detalhe-aviso");
    const btnFecharDetalhe = document.getElementById("btn-fechar-detalhe");
    const btnVerTodos = document.getElementById("btn-ver-todos");
    
    let filtroAtual = 'todos';
    let termoBuscaAtual = '';
    
    window.idAvisoEditando = null;

    // CONTROLA A VISIBILIDADE DO CAMPO DE DATA BASEADO NA CATEGORIA
    function atualizarCampoData(tipo) {
        if (tipo === 'evento') {
            campoDataEvento.style.display = 'block';
            inputData.required = true; 
        } else {
            campoDataEvento.style.display = 'none';
            inputData.required = false;
            inputData.value = ''; 
        }
    }

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

    // LÓGICA DO MODAL DE CRIAR/EDITAR
    btnNovo?.addEventListener("click", () => {
        window.idAvisoEditando = null; 
        form.reset(); 
        document.querySelector(".modal-cabecalho h3").textContent = "Novo Aviso"; 
        carregarTurmasSelect(); 

        botoesCategoria.forEach(b => b.classList.remove("ativo"));
        document.querySelector('.btn-categoria[data-valor="comunicado"]').classList.add("ativo");
        inputTipo.value = "comunicado"; 
        atualizarCampoData("comunicado"); 
        
        modal.showModal();
    });

    btnCancelar?.addEventListener("click", () => modal.close());
    btnFechar?.addEventListener("click", () => modal.close());

    botoesCategoria.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesCategoria.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            inputTipo.value = botao.dataset.valor;
            atualizarCampoData(botao.dataset.valor); 
        });
    });

    // LÓGICA DE SALVAR NO BANCO (CRIAR OU EDITAR)
    form?.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const titulo = document.getElementById("aviso-titulo").value;
        const descricao = document.getElementById("aviso-mensagem").value;
        const tipo = inputTipo.value; 
        const turmaId = document.getElementById("aviso-turma").value; 
        const autorId = localStorage.getItem('usuarioLogadoId'); 
        
        // Se for evento, pega a data. Se for comunicado, manda null
        const dataEvento = tipo === 'evento' ? document.getElementById("aviso-data").value : null; 

        if (!turmaId) {
            alert("Por favor, selecione uma turma.");
            return;
        }

        if (tipo === 'evento' && !dataEvento) {
            alert("Por favor, selecione a data do evento.");
            return;
        }

        try {
            if (window.idAvisoEditando) {
                await AvisosService.atualizar(window.idAvisoEditando, titulo, descricao, tipo, turmaId, dataEvento);
                alert("Aviso atualizado com sucesso!");
            } else {
                await AvisosService.criar(titulo, descricao, tipo, turmaId, autorId, dataEvento);
                alert("Aviso publicado com sucesso!");
            }
            
            modal.close();
            form.reset();
            window.idAvisoEditando = null;
            
            carregarEstatisticas();
            carregarAvisosNaTela();

        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro ao salvar o aviso. Verifique o console.");
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
        const autorIdLogado = localStorage.getItem('usuarioLogadoId');

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

                const ehDonoDoAviso = String(aviso.autor_id) === String(autorIdLogado);

                const botoesAcao = ehDonoDoAviso 
                    ? `<div class="menu-container">
                        <button class="btn-opcoes" onclick="event.stopPropagation(); toggleMenu(this)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="menu-dropdown">
                            <button onclick="event.stopPropagation(); prepararEdicao(${aviso.id}, '${aviso.titulo.replace(/'/g, "\\'")}', '${aviso.descricao.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', '${aviso.tipo}', '${aviso.turma_id}', '${aviso.data_evento || ''}')">
                                ✏️ Editar
                            </button>
                            <button class="excluir" onclick="event.stopPropagation(); excluirAviso(${aviso.id})">
                                🗑️ Excluir
                            </button>
                        </div>
                       </div>` 
                    : "";

                // CRIA AS DUAS DATAS
                const dataPublicacao = new Date(aviso.created_at).toLocaleDateString('pt-BR');
                let textoDataEvento = '';
                if (aviso.tipo === 'evento' && aviso.data_evento) {
                    const dataEv = new Date(aviso.data_evento + 'T12:00:00').toLocaleDateString('pt-BR');
                    textoDataEvento = ` | 🗓️ Evento: ${dataEv}`;
                }

                return `
                    <div class="card-aviso" 
                         onclick="abrirDetalheAviso('${aviso.id}', '${aviso.titulo.replace(/'/g, "\\'")}', '${aviso.descricao.replace(/'/g, "\\'").replace(/\n/g, "\\n")}', '${aviso.created_at}', '${aviso.data_evento || ''}', '${aviso.tipo}', ${qtdLeituras}, ${totalAlunos})"
                         style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #eee;">
                        
                        <div class="aviso-info">
                            <span class="badge-tipo badge-${aviso.tipo.toLowerCase()}">${aviso.tipo}</span>
                            <h3 style="margin: 0.5rem 0; font-size: 1.1rem; color: #333;">${aviso.titulo}</h3>
                            
                            <!-- MOSTRA AS DUAS DATAS AQUI -->
                            <span style="font-size: 0.8125rem; color: #888;">
                                📅 Publicado: ${dataPublicacao} ${textoDataEvento}
                            </span>
                        </div>

                        <div class="aviso-status ${classeCor}" style="display: flex; align-items: center; gap: 1rem;">
                            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 1.1rem;">
                                    ${icone}
                                    ${qtdLeituras}/${totalAlunos}
                                </div>
                                <span style="font-size: 0.75rem; color: #888;">leituras</span>
                            </div>
                            ${botoesAcao}
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

// FUNÇÕES GLOBAIS (FORA DO ESCOPO PRINCIPAL)

window.abrirDetalheAviso = function(id, titulo, descricao, dataCriacao, dataEvento, tipo, lidos, total) {
    const modal = document.getElementById("modal-detalhe-aviso");
    document.getElementById("detalhe-titulo").textContent = titulo;
    document.getElementById("detalhe-descricao").textContent = descricao.replace(/\\n/g, '\n');
    
    const dataPublicacao = new Date(dataCriacao).toLocaleDateString('pt-BR');
    let textoData = `Publicado em ${dataPublicacao}`;
    
    if (tipo === 'evento' && dataEvento) {
        const dataEv = new Date(dataEvento + 'T12:00:00').toLocaleDateString('pt-BR');
        textoData = `🗓️ Evento: ${dataEv} | 📅 Publicado: ${dataPublicacao}`;
    }
        
    document.getElementById("detalhe-data").textContent = textoData;
    
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
        barra.style.background = 'var(--color-success)'; 
        statusTexto.className = 'progresso-texto';
        document.getElementById("detalhe-faltam").textContent = `${faltam} responsáveis ainda não leram`;
    }
    modal.showModal();
}

window.toggleMenu = function(botao) {
    const menu = botao.nextElementSibling;
    document.querySelectorAll('.menu-dropdown').forEach(m => {
        if (m !== menu) m.classList.remove('aberto');
    });
    menu.classList.toggle('aberto');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
    }
});

window.prepararEdicao = function(id, titulo, descricao, tipo, turmaId, dataEvento) {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));

    const modal = document.getElementById("modal-aviso");
    document.querySelector(".modal-cabecalho h3").textContent = "Editar Aviso";
    
    document.getElementById("aviso-titulo").value = titulo;
    document.getElementById("aviso-mensagem").value = descricao.replace(/\\n/g, '\n');
    
    const campoDataEvento = document.getElementById("campo-data-evento");
    if (tipo === 'evento') {
        campoDataEvento.style.display = 'block';
        document.getElementById("aviso-data").value = dataEvento;
    } else {
        campoDataEvento.style.display = 'none';
        document.getElementById("aviso-data").value = '';
    }
    
    const botoesCategoria = document.querySelectorAll(".btn-categoria");
    botoesCategoria.forEach(b => b.classList.remove("ativo"));
    document.querySelector(`.btn-categoria[data-valor="${tipo}"]`).classList.add("ativo");
    document.getElementById("aviso-tipo").value = tipo;

    const selectTurma = document.getElementById("aviso-turma");
    setTimeout(() => {
        selectTurma.value = turmaId;
    }, 300);

    window.idAvisoEditando = id;
    modal.showModal();
};

window.excluirAviso = async function(id) {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));

    if (!confirm("Tem certeza que deseja excluir este aviso? Essa ação não pode ser desfeita.")) return;
    
    try {
        await AvisosService.excluir(id);
        window.location.reload(); 
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Erro ao excluir o aviso.");
    }
};