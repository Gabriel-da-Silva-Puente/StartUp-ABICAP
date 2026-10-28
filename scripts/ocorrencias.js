(function () {
    const listaContainer = document.getElementById("lista-ocorrencias");
    const inputBusca = document.getElementById("busca-ocorrencias");
    const botoesFiltro = document.querySelectorAll(".filtros-ocorrencias button");
    const subtitulo = document.getElementById("subtitulo-ocorrencias-data");

    const modal = document.getElementById("modal-ocorrencia");
    const form = document.getElementById("form-ocorrencia");
    const btnNovaOcorrencia = document.getElementById("btn-adicionar-ocorrencia");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const btnCancelar = document.getElementById("btn-cancelar-ocorrencia");
    const selectAlunoModal = document.getElementById("ocorrencia-aluno");
    
    const botoesTipo = document.querySelectorAll(".btn-categoria");
    const inputTipo = document.getElementById("ocorrencia-tipo");

    const modalDetalhe = document.getElementById("modal-detalhe-ocorrencia");

    let filtroAtual = 'todos';
    let termoBuscaAtual = '';
    let listaOcorrenciasAtual = [];
    let idOcorrenciaEditando = null;

    // CARREGA OS ALUNOS DA TURMA NO MODAL
    async function carregarAlunosModal() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) return;

        try {
            const alunos = await OcorrenciasService.listarAlunosPorTurma(turmaId);
            selectAlunoModal.innerHTML = '<option value="">Selecione o aluno...</option>';
            alunos.forEach(a => {
                selectAlunoModal.innerHTML += `<option value="${a.id}">${a.nome}</option>`;
            });
        } catch (e) {
            console.error("Erro ao carregar alunos:", e);
            selectAlunoModal.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    // CARREGA A LISTA DE OCORRÊNCIAS DA TURMA
    async function carregarOcorrencias() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Sua Turma";
        
        if (!turmaId) {
            listaContainer.innerHTML = "<p>Nenhuma turma selecionada.</p>";
            return;
        }

        try {
            const ocorrencias = await OcorrenciasService.listarTodas(filtroAtual, turmaId, termoBuscaAtual);
            listaOcorrenciasAtual = ocorrencias;
            
            if (subtitulo) {
                subtitulo.textContent = `${ocorrencias.length} registros · ${turmaNome}`;
            }

            if (ocorrencias.length === 0) {
                listaContainer.innerHTML = "<p>Nenhuma ocorrência encontrada.</p>";
                return;
            }

            listaContainer.innerHTML = ocorrencias.map(oc => {
                const dataFormatada = new Date(oc.created_at).toLocaleDateString('pt-BR');
                
                let classeTipo = 'tipo-comportamental';
                if (oc.tipo === 'saude') classeTipo = 'tipo-saude';
                if (oc.tipo === 'acidente') classeTipo = 'tipo-acidente';
                if (oc.tipo === 'alimentacao') classeTipo = 'tipo-alimentacao';
                if (oc.tipo === 'outro') classeTipo = 'tipo-outro';
                if (oc.tipo === 'disciplinar') classeTipo = 'tipo-disciplinar';

                const isDisciplinar = oc.tipo === 'disciplinar';
                const cardClass = isDisciplinar ? 'card-ocorrencia disciplinar' : 'card-ocorrencia';

                const menuAcoes = !isDisciplinar ? `
                    <div class="menu-container" style="position: relative; margin-left: auto;">
                        <button class="btn-opcoes" onclick="event.stopPropagation(); toggleMenu(this)" style="background:none; border:none; cursor:pointer; padding:4px; color: #888;">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="menu-dropdown" style="position:absolute; right:0; top:100%; background:#fff; border:1px solid #ccc; border-radius:6px; display:none; z-index:10; padding:0.25rem; box-shadow:0 4px 10px rgba(0,0,0,0.1); width: 120px;">
                            <button onclick="event.stopPropagation(); prepararEdicaoOcorrencia(${oc.id})" style="padding:0.5rem; width:100%; text-align:left; border:none; background:none; cursor:pointer; font-size:0.8rem;">✏️ Editar</button>
                            <button onclick="event.stopPropagation(); excluirOcorrencia(${oc.id})" style="padding:0.5rem; width:100%; text-align:left; border:none; background:none; cursor:pointer; font-size:0.8rem; color:#DC3545;">🗑️ Excluir</button>
                        </div>
                    </div>
                ` : '';

                return `
                    <div class="${cardClass}" style="display: flex; align-items: flex-start; gap: 1rem; cursor: pointer;" onclick="abrirDetalheOcorrencia(${oc.id})">
                        <div class="card-ocorrencia-info" style="flex: 1;">
                            <div class="card-ocorrencia-topo">
                                <span class="card-ocorrencia-aluno">${oc.aluno_nome}</span>
                                <span class="card-ocorrencia-tipo ${classeTipo}">${oc.tipo}</span>
                            </div>
                            <p class="card-ocorrencia-descricao">${oc.descricao}</p>
                            <span class="card-ocorrencia-data">${dataFormatada}</span>
                        </div>
                        ${menuAcoes}
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar ocorrências:", erro);
            listaContainer.innerHTML = "<p>Erro ao carregar as ocorrências.</p>";
        }
    }

    // LÓGICA DOS FILTROS E BUSCA
    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesFiltro.forEach(b => { b.classList.remove("ativo"); b.setAttribute("aria-pressed", "false"); });
            botao.classList.add("ativo"); botao.setAttribute("aria-pressed", "true");
            filtroAtual = botao.dataset.filtro;
            carregarOcorrencias();
        });
    });

    inputBusca?.addEventListener("input", (e) => {
        termoBuscaAtual = e.target.value;
        clearTimeout(window.buscaTimer);
        window.buscaTimer = setTimeout(carregarOcorrencias, 400);
    });

    // LÓGICA DO MODAL DE CRIAR
    btnNovaOcorrencia?.addEventListener("click", () => {
        idOcorrenciaEditando = null;
        form.reset();
        document.getElementById("modal-ocorrencia-titulo").textContent = "Nova Ocorrência";
        
        botoesTipo.forEach(b => b.classList.remove("ativo"));
        document.querySelector('.btn-categoria[data-valor="comportamental"]').classList.add("ativo");
        inputTipo.value = "comportamental";

        carregarAlunosModal();
        modal.showModal();
    });

    btnFecharModal?.addEventListener("click", () => modal.close());
    btnCancelar?.addEventListener("click", () => modal.close());

    botoesTipo.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesTipo.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            inputTipo.value = botao.dataset.valor;
        });
    });

    // SALVAR OCORRÊNCIA (CRIAR OU EDITAR)
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const alunoId = selectAlunoModal.value;
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        const autorId = localStorage.getItem('usuarioLogadoId');

        if (!alunoId) { alert("Por favor, selecione o aluno."); return; }

        const dados = {
            tipo: inputTipo.value,
            aluno_id: alunoId, 
            turma_id: turmaId,
            autor_id: autorId,
            descricao: document.getElementById("ocorrencia-descricao").value,
            gravidade: document.getElementById("ocorrencia-gravidade").value,
            providencias: document.getElementById("ocorrencia-providencia").value,
            acompanhamento: document.getElementById("ocorrencia-acompanhamento").checked,
            status: 'aberto'
        };

        try {
            if (idOcorrenciaEditando) {
                await OcorrenciasService.atualizar(idOcorrenciaEditando, dados);
            } else {
                await OcorrenciasService.criar(dados);
            }
            modal.close();
            carregarOcorrencias();
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro ao salvar a ocorrência.");
        }
    });

    // LÓGICA DO MENU DE 3 PONTINHOS
    window.toggleMenu = function(botao) {
        document.querySelectorAll('.menu-dropdown').forEach(m => {
            if (m !== botao.nextElementSibling) m.style.display = 'none';
        });
        const dropdown = botao.nextElementSibling;
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-container')) {
            document.querySelectorAll('.menu-dropdown').forEach(m => m.style.display = 'none');
        }
    });

    // PREPARAR EDIÇÃO
    window.prepararEdicaoOcorrencia = function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.style.display = 'none');
        
        const oc = listaOcorrenciasAtual.find(o => o.id === id);
        if (!oc) return;

        idOcorrenciaEditando = id;
        document.getElementById("modal-ocorrencia-titulo").textContent = "Editar Ocorrência";
        
        botoesTipo.forEach(b => b.classList.remove("ativo"));
        const botaoClicado = document.querySelector(`.btn-categoria[data-valor="${oc.tipo}"]`);
        if(botaoClicado) botaoClicado.classList.add("ativo");
        inputTipo.value = oc.tipo;

        carregarAlunosModal().then(() => {
            selectAlunoModal.value = oc.aluno_id;
        });
        
        document.getElementById("ocorrencia-descricao").value = oc.descricao;
        document.getElementById("ocorrencia-gravidade").value = oc.gravidade || 'leve';
        document.getElementById("ocorrencia-providencia").value = oc.providencias || '';
        document.getElementById("ocorrencia-acompanhamento").checked = oc.acompanhamento || false;

        modal.showModal();
    }

    // EXCLUIR
    window.excluirOcorrencia = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.style.display = 'none');
        if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;
        try {
            await OcorrenciasService.excluir(id);
            carregarOcorrencias();
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Erro ao excluir.");
        }
    }

    // LÓGICA DO MODAL DE DETALHES
    document.getElementById("btn-fechar-detalhe")?.addEventListener("click", () => modalDetalhe.close());
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.close();
    });

    window.abrirDetalheOcorrencia = function(id) {
        const oc = listaOcorrenciasAtual.find(o => o.id === id);
        if (!oc) return;

        document.getElementById("detalhe-aluno").textContent = oc.aluno_nome;
        document.getElementById("detalhe-data").textContent = new Date(oc.created_at).toLocaleDateString('pt-BR');
        document.getElementById("detalhe-descricao").textContent = oc.descricao;

        const badge = document.getElementById("detalhe-tipo");
        badge.textContent = oc.tipo;
        badge.className = `card-ocorrencia-tipo tipo-${oc.tipo}`;

        const camposExtras = document.getElementById("detalhe-campos-extras");
        if (oc.gravidade || oc.providencia || oc.acompanhamento) {
            camposExtras.style.display = 'block';
            document.getElementById("detalhe-gravidade").textContent = oc.gravidade || 'Não informada';
            document.getElementById("detalhe-providencia").textContent = oc.providencia || 'Não informadas';
            document.getElementById("detalhe-acompanhamento").textContent = oc.acompanhamento ? 'Sim' : 'Não';
        } else {
            camposExtras.style.display = 'none';
        }

        modalDetalhe.showModal();
    }

    // INICIALIZA
    carregarOcorrencias();

})();