const modalOcorrencia = document.getElementById("modal-ocorrencia");
const modalDetalhe = document.getElementById("modal-detalhe-ocorrencia");
let idOcorrenciaEditando = null;
let listaOcorrenciasAtual = []; 
document.addEventListener("DOMContentLoaded", () => {
    const listaContainer = document.getElementById("lista-ocorrencias");
    const inputBusca = document.getElementById("busca-ocorrencias");
    const selectTurma = document.getElementById("filtro-turma");
    const botoesFiltro = document.querySelectorAll(".filtros-ocorrencias button");
    const subtitulo = document.getElementById("subtitulo-ocorrencias-turma");

    const form = document.getElementById("form-ocorrencia");
    const btnNovaOcorrencia = document.getElementById("btn-nova-ocorrencia");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const btnCancelar = document.getElementById("btn-cancelar-ocorrencia");
    
    const selectTurmaModal = document.getElementById("ocorrencia-turma");
    const selectAlunoModal = document.getElementById("ocorrencia-aluno");
    const botoesTipo = document.querySelectorAll(".btn-categoria");
    const inputTipo = document.getElementById("ocorrencia-tipo");
    const camposDisciplinar = document.getElementById("campos-disciplinar");

    let filtroAtual = 'todos';
    let termoBuscaAtual = '';
    let turmaFiltroAtual = 'todas';

    function atualizarCamposDisciplinar(tipo) {
        if (tipo === 'disciplinar') {
            camposDisciplinar.hidden = false;
        } else {
            camposDisciplinar.hidden = true;
        }
    }

    async function carregarTurmas() {
        try {
            const turmas = await OcorrenciasService.listarTurmas();
            
            selectTurma.innerHTML = '<option value="todas">Todas as turmas</option>';
            selectTurmaModal.innerHTML = '<option value="">Selecione a turma...</option>';
            turmas.forEach(t => {
                selectTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
                selectTurmaModal.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
            });
        } catch (e) {
            console.error("Erro ao carregar turmas:", e);
        }
    }

    selectTurmaModal?.addEventListener("change", async (e) => {
        const turmaId = e.target.value;
        selectAlunoModal.innerHTML = '<option value="">Carregando...</option>';
        
        if (!turmaId) {
            selectAlunoModal.innerHTML = '<option value="">Selecione a turma primeiro...</option>';
            return;
        }

        try {
            const alunos = await OcorrenciasService.listarAlunosPorTurma(turmaId);
            selectAlunoModal.innerHTML = '<option value="">Selecione o aluno...</option>';
            alunos.forEach(a => {
                selectAlunoModal.innerHTML += `<option value="${a.id}">${a.nome}</option>`;
            });
        } catch (erro) {
            console.error("Erro ao buscar alunos:", erro);
            selectAlunoModal.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    });

    async function carregarOcorrencias() {
        try {
            const ocorrencias = await OcorrenciasService.listarTodas(filtroAtual, turmaFiltroAtual, termoBuscaAtual);
            listaOcorrenciasAtual = ocorrencias; 
            
            if (subtitulo) {
                let txtTurma = "Todas as turmas";
                if (turmaFiltroAtual !== 'todas' && selectTurma.selectedIndex > -1) {
                    txtTurma = selectTurma.options[selectTurma.selectedIndex].text;
                }
                subtitulo.textContent = `${ocorrencias.length} registros · ${txtTurma}`;
            }

            if (ocorrencias.length === 0) {
                listaContainer.innerHTML = "<p>Nenhuma ocorrência encontrada.</p>";
                return;
            }

            listaContainer.innerHTML = ocorrencias.map(oc => {
                const dataFormatada = new Date(oc.created_at).toLocaleDateString('pt-BR');
                const nomeTurma = oc.turma_nome;
                const nomeAluno = oc.aluno_nome;

                let classeTipo = 'tipo-comportamental';
                if (oc.tipo === 'saude') classeTipo = 'tipo-saude';
                if (oc.tipo === 'acidente') classeTipo = 'tipo-acidente';
                if (oc.tipo === 'alimentacao') classeTipo = 'tipo-alimentacao';
                if (oc.tipo === 'outro') classeTipo = 'tipo-outro';
                if (oc.tipo === 'disciplinar') classeTipo = 'tipo-disciplinar';

                const isDisciplinar = oc.tipo === 'disciplinar';
                const cardClass = isDisciplinar ? 'card-ocorrencia disciplinar' : 'card-ocorrencia';

                return `
                    <div class="${cardClass}" style="cursor: pointer;" onclick="abrirDetalheOcorrencia(${oc.id})">
                        <div class="card-ocorrencia-info">
                            <div class="card-ocorrencia-topo">
                                <span class="card-ocorrencia-aluno">${nomeAluno}</span>
                                <span class="card-ocorrencia-turma">${nomeTurma}</span>
                                <span class="card-ocorrencia-tipo ${classeTipo}">${oc.tipo}</span>
                            </div>
                            <p class="card-ocorrencia-descricao">${oc.descricao}</p>
                            <span class="card-ocorrencia-data">${dataFormatada}</span>
                        </div>
                        <div class="card-ocorrencia-status">
                            <span class="status-badge status-notificado">Notificado</span>
                            <div class="menu-container">
                                <button class="btn-opcoes" onclick="event.stopPropagation(); toggleMenu(this)">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                <div class="menu-dropdown">
                                    <button onclick="event.stopPropagation(); prepararEdicaoOcorrencia(${oc.id})">✏️ Editar</button>
                                    <button class="excluir" onclick="event.stopPropagation(); excluirOcorrencia(${oc.id})">🗑️ Excluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar ocorrências:", erro);
            listaContainer.innerHTML = "<p>Erro ao carregar as ocorrências.</p>";
        }
    }

    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesFiltro.forEach(b => { b.classList.remove("ativo"); b.setAttribute("aria-pressed", "false"); });
            botao.classList.add("ativo"); botao.setAttribute("aria-pressed", "true");
            filtroAtual = botao.dataset.filtro;
            carregarOcorrencias();
        });
    });

    selectTurma?.addEventListener("change", (e) => {
        turmaFiltroAtual = e.target.value;
        carregarOcorrencias();
    });

    inputBusca?.addEventListener("input", (e) => {
        termoBuscaAtual = e.target.value;
        clearTimeout(window.buscaTimer);
        window.buscaTimer = setTimeout(carregarOcorrencias, 400);
    });

    btnNovaOcorrencia?.addEventListener("click", () => {
        idOcorrenciaEditando = null;
        form.reset();
        document.getElementById("modal-ocorrencia-titulo").textContent = "Nova Ocorrência";
        
        selectAlunoModal.innerHTML = '<option value="">Selecione a turma primeiro...</option>';
        botoesTipo.forEach(b => b.classList.remove("ativo"));
        document.querySelector('.btn-categoria[data-valor="comportamental"]').classList.add("ativo");
        inputTipo.value = "comportamental";
        atualizarCamposDisciplinar("comportamental");

        modalOcorrencia.showModal();
    });

    btnFecharModal?.addEventListener("click", () => modalOcorrencia.close());
    btnCancelar?.addEventListener("click", () => modalOcorrencia.close());

    botoesTipo.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesTipo.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            inputTipo.value = botao.dataset.valor;
            atualizarCamposDisciplinar(botao.dataset.valor);
        });
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const alunoId = selectAlunoModal.value;
        if (!alunoId) { alert("Por favor, selecione o aluno."); return; }

        const dados = {
            tipo: inputTipo.value,
            aluno_id: alunoId, 
            turma_id: selectTurmaModal.value,
            descricao: document.getElementById("ocorrencia-descricao").value,
            gravidade: inputTipo.value === 'disciplinar' ? document.getElementById("ocorrencia-gravidade").value : null,
            providencias: inputTipo.value === 'disciplinar' ? document.getElementById("ocorrencia-providencia").value : null,
            acompanhamento: inputTipo.value === 'disciplinar' ? document.getElementById("ocorrencia-acompanhamento").checked : false
        };

        try {
            if (idOcorrenciaEditando) {
                await OcorrenciasService.atualizar(idOcorrenciaEditando, dados);
            } else {
                await OcorrenciasService.criar(dados);
            }
            modalOcorrencia.close();
            carregarOcorrencias();
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro ao salvar a ocorrência.");
        }
    });

    document.getElementById("btn-fechar-detalhe")?.addEventListener("click", () => modalDetalhe.close());
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.close();
    });

    carregarTurmas().then(() => carregarOcorrencias());
});



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

window.abrirDetalheOcorrencia = function(id) {
    const oc = listaOcorrenciasAtual.find(o => o.id === id);
    if (!oc) return;

    document.getElementById("detalhe-aluno").textContent = oc.aluno_nome;
    document.getElementById("detalhe-turma").textContent = oc.turma_nome;
    document.getElementById("detalhe-data").textContent = new Date(oc.created_at).toLocaleDateString('pt-BR');
    document.getElementById("detalhe-descricao").textContent = oc.descricao;

    const badge = document.getElementById("detalhe-tipo");
    badge.textContent = oc.tipo;
    badge.className = `card-ocorrencia-tipo tipo-${oc.tipo}`;

    const camposExtras = document.getElementById("detalhe-campos-disciplinar");
    if (oc.tipo === 'disciplinar') {
        camposExtras.style.display = 'block';
        document.getElementById("detalhe-gravidade").textContent = oc.gravidade || 'Não informada';
        document.getElementById("detalhe-providencia").textContent = oc.providencias || 'Não informadas';
        document.getElementById("detalhe-acompanhamento").textContent = oc.acompanhamento ? 'Sim' : 'Não';
    } else {
        camposExtras.style.display = 'none';
    }

    modalDetalhe.showModal();
}

window.prepararEdicaoOcorrencia = async function(id) {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
    
    const oc = listaOcorrenciasAtual.find(o => o.id === id);
    if (!oc) return;

    idOcorrenciaEditando = id;
    document.getElementById("modal-ocorrencia-titulo").textContent = "Editar Ocorrência";
    
    const botoesTipo = document.querySelectorAll(".btn-categoria");
    botoesTipo.forEach(b => b.classList.remove("ativo"));
    const botaoClicado = document.querySelector(`.btn-categoria[data-valor="${oc.tipo}"]`);
    if(botaoClicado) botaoClicado.classList.add("ativo");
    
    document.getElementById("ocorrencia-tipo").value = oc.tipo;
    
    const camposDisciplinar = document.getElementById("campos-disciplinar");
    if (oc.tipo === 'disciplinar') {
        camposDisciplinar.hidden = false;
    } else {
        camposDisciplinar.hidden = true;
    }

    document.getElementById("ocorrencia-turma").value = oc.turma_id;
    document.getElementById("ocorrencia-descricao").value = oc.descricao;

    if (oc.tipo === 'disciplinar') {
        document.getElementById("ocorrencia-gravidade").value = oc.gravidade;
        document.getElementById("ocorrencia-providencia").value = oc.providencias;
        document.getElementById("ocorrencia-acompanhamento").checked = oc.acompanhamento;
    }

    if (oc.turma_id) {
        try {
            const alunos = await OcorrenciasService.listarAlunosPorTurma(oc.turma_id);
            const selectAlunoModal = document.getElementById("ocorrencia-aluno");
            selectAlunoModal.innerHTML = '<option value="">Selecione o aluno...</option>';
            alunos.forEach(a => {
                selectAlunoModal.innerHTML += `<option value="${a.id}">${a.nome}</option>`;
            });
            selectAlunoModal.value = oc.aluno_id;
        } catch (e) { console.error(e); }
    }

    modalOcorrencia.showModal();
}

window.excluirOcorrencia = async function(id) {
    document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
    if (!confirm("Tem certeza que deseja excluir esta ocorrência?")) return;
    try {
        await OcorrenciasService.excluir(id);
        window.location.reload();
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Erro ao excluir.");
    }
}