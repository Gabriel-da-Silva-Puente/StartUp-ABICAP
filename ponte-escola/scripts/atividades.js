(function () {
    const listaEl = document.getElementById('lista-atividades');
    const buscaEl = document.getElementById('busca-atividades');
    const filtrosEl = document.getElementById('filtros-atividades');
    const modalEl = document.getElementById('modal-atividade');
    const modalDetalhe = document.getElementById('modal-detalhe-atividade'); 
    const formEl = document.getElementById('form-atividade');
    const avisoEl = document.getElementById('aviso-flutuante');

    let filtro = 'todas';
    let dadosAtividades = []; 
    let idAtividadeEditando = null; 
    let idAtividadeDetalhe = null; 

    const iconeRelogio = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';

    function escapar(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    function avisar(mensagem) {
        avisoEl.textContent = mensagem;
        avisoEl.classList.add('visivel');
        setTimeout(() => avisoEl.classList.remove('visivel'), 2600);
    }

    function renderizarResumo() { 
        const confirmadas = dadosAtividades.filter(a => a.lidas === a.total && a.total > 0).length;
        const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Jardim II — Turma A";

        document.getElementById('subtitulo-atividades-turma').textContent =
            `${dadosAtividades.length} ${dadosAtividades.length === 1 ? 'atividade' : 'atividades'} · ${turmaNome}`;
        document.getElementById('stat-total').textContent = dadosAtividades.length;
        document.getElementById('stat-aguardando').textContent = dadosAtividades.length - confirmadas;
        document.getElementById('stat-confirmadas').textContent = confirmadas;
    }

    function renderizar() {
        const termo = buscaEl.value.trim().toLowerCase();
        renderizarResumo();

        const exibidas = dadosAtividades.filter(a => { 
            const completa = a.lidas === a.total && a.total > 0;
            if (filtro === 'aguardando' && completa) return false;
            if (filtro === 'confirmadas' && !completa) return false;
            return a.titulo.toLowerCase().includes(termo) || a.descricao.toLowerCase().includes(termo);
        });

        if (exibidas.length === 0) {
            listaEl.innerHTML = '<p class="lista-vazia">Nenhuma atividade encontrada.</p>';
            return;
        }

        listaEl.innerHTML = exibidas.map(a => {
            const completa = a.lidas === a.total && a.total > 0;
            
            const avisoPrazo = a.prazoEncerrado 
                ? `<span style="font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 99px; background: #FDECEE; color: var(--color-danger);">⚠ Prazo encerrado</span>` 
                : '';

            return `
            <div class="card-aviso" 
                 onclick="abrirDetalheAtividade(${a.id})"
                 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #eee;">
                
                <div class="aviso-info">
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
                        <span class="badge-tipo badge-comunicado">Atividade</span>
                        ${avisoPrazo}
                    </div>
                    <h3 style="margin: 0.5rem 0; font-size: 1.1rem; color: #333;">${escapar(a.titulo)}</h3>
                    <span style="font-size: 0.8125rem; color: #888;">📅 Prazo: ${a.prazo}</span>
                </div>

                <div class="aviso-status" style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; color: ${completa ? 'var(--color-success)' : 'var(--color-warning)'};">
                        <div style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 1.1rem;">
                            ${iconeRelogio}
                            ${a.lidas}/${a.total}
                        </div>
                        <span style="font-size: 0.75rem; color: #888;">leituras</span>
                    </div>

                    <div class="menu-container" onclick="event.stopPropagation();">
                        <button class="btn-opcoes" onclick="toggleMenu(this)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="menu-dropdown">
                            <button onclick="prepararEdicao(${a.id})">✏️ Editar</button>
                            <button class="excluir" onclick="excluirAtividade(${a.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    async function carregarAtividades() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) {
            listaEl.innerHTML = '<p class="lista-vazia">Selecione uma turma no topo.</p>';
            return;
        }
        
        listaEl.innerHTML = '<p class="lista-vazia">Carregando...</p>';
        
        try {
            dadosAtividades = await AtividadeService.listarPorTurma(turmaId); 
            renderizar();
        } catch (erro) {
            console.error(erro);
            listaEl.innerHTML = '<p class="lista-vazia">Erro ao carregar as atividades.</p>';
        }
    }

    buscaEl.addEventListener('input', renderizar);

    filtrosEl.addEventListener('click', e => {
        const botao = e.target.closest('button[data-filtro]');
        if (!botao) return;
        filtro = botao.dataset.filtro;
        filtrosEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === botao));
        renderizar();
    });

    window.toggleMenu = function(botao) {
        const dropdown = botao.nextElementSibling;
        document.querySelectorAll('.menu-dropdown').forEach(m => {
            if (m !== dropdown) m.classList.remove('aberto');
        });
        dropdown.classList.toggle('aberto');
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-container')) {
            document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        }
    });

    document.getElementById('btn-nova-atividade').addEventListener('click', () => {
        idAtividadeEditando = null; 
        formEl.reset();
        document.getElementById('modal-titulo').textContent = "Nova atividade"; 
        formEl.querySelector('button[type="submit"]').textContent = "Publicar atividade"; 
        formEl.prazo.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        modalEl.showModal();
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => modalEl.close());
    document.getElementById('btn-fechar-modal').addEventListener('click', () => modalEl.close()); 

    modalEl.addEventListener('click', e => {
        if (e.target === modalEl) modalEl.close();
    });

    window.prepararEdicao = function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        const ativ = dadosAtividades.find(a => a.id === id);
        if (!ativ) return;

        idAtividadeEditando = id;
        document.getElementById('modal-titulo').textContent = "Editar atividade";
        formEl.querySelector('button[type="submit"]').textContent = "Salvar alterações";
        
        formEl.titulo.value = ativ.titulo;
        formEl.descricao.value = ativ.descricao;
        formEl.prazo.value = ativ.prazoOriginal;

        modalEl.showModal();
    }

    formEl.addEventListener('submit', async e => { 
        e.preventDefault();
        
        const turmaId = localStorage.getItem('turmaVisualizadaId'); 
        const autorId = localStorage.getItem('usuarioLogadoId'); 

        if (!turmaId) { alert("Selecione uma turma no topo."); return; } 

        try { 
            if (idAtividadeEditando) {
                await AtividadeService.atualizar(
                    idAtividadeEditando,
                    formEl.titulo.value.trim(),
                    formEl.descricao.value.trim(),
                    formEl.prazo.value
                );
                avisar('Atividade atualizada.');
            } else {
                await AtividadeService.criar(
                    formEl.titulo.value.trim(),
                    formEl.descricao.value.trim(),
                    formEl.prazo.value,
                    turmaId,
                    autorId
                );
                avisar('Atividade publicada.');
            }
            modalEl.close();
            carregarAtividades(); 
        } catch (erro) { 
            console.error(erro);
            alert("Erro ao salvar atividade.");
        }
    });

    window.excluirAtividade = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;
        try {
            await AtividadeService.excluir(id);
            carregarAtividades();
        } catch (erro) {
            console.error(erro);
            alert("Erro ao excluir a atividade.");
        }
    }

    document.getElementById('btn-fechar-detalhe').addEventListener('click', () => modalDetalhe.close());
    modalDetalhe.addEventListener('click', (e) => {
        if (e.target === modalDetalhe) modalDetalhe.close();
    });

    window.abrirDetalheAtividade = async function(id) {
        const ativ = dadosAtividades.find(a => a.id === id);
        if (!ativ) return;

        idAtividadeDetalhe = id;
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Sua Turma";

        document.getElementById('detalhe-titulo').textContent = ativ.titulo;
        document.getElementById('detalhe-data-envio').textContent = ativ.criadaEm.replace('Criada em ', '');
        document.getElementById('detalhe-turma').textContent = turmaNome;
        document.getElementById('detalhe-descricao').textContent = ativ.descricao;
        
        document.getElementById('detalhe-lidos').textContent = ativ.lidas;
        document.getElementById('detalhe-nao-lidos').textContent = ativ.total - ativ.lidas;
        document.getElementById('detalhe-total').textContent = ativ.total;

        const tagPrazo = document.getElementById('detalhe-status-prazo');
        const secaoNotificar = document.getElementById('secao-notificar'); // NOVO

        if (ativ.prazoEncerrado) {
            tagPrazo.style.display = 'inline-block';
            secaoNotificar.style.display = 'block'; // Mostra a seção de notificar
        } else {
            tagPrazo.style.display = 'none';
            secaoNotificar.style.display = 'none'; // Esconde a seção
        }

        if (ativ.prazoEncerrado) {
            document.getElementById('lista-alunos-notificar').innerHTML = '<p style="font-size:0.8rem; color:#888;">Carregando alunos...</p>';
            document.getElementById('btn-notificar-nao-fizeram').style.display = 'none';
            document.getElementById('btn-selecionar-todos').textContent = 'Selecionar todos';
            
            try {
                const todosAlunos = await AtividadeService.listarAlunosTurma(turmaId);
                const alunosLeram = await AtividadeService.listarAlunosQueLeram(id);
                
                const alunosNaoLeram = todosAlunos.filter(a => !alunosLeram.includes(a.id));

                if (alunosNaoLeram.length === 0) {
                    document.getElementById('lista-alunos-notificar').innerHTML = '<p style="font-size:0.8rem; color:var(--color-success); font-weight:600;">Todos os alunos já leram esta atividade!</p>';
                    return;
                }

                document.getElementById('btn-notificar-nao-fizeram').style.display = 'block';
                document.getElementById('lista-alunos-notificar').innerHTML = alunosNaoLeram.map(aluno => `
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #eee; border-radius: 8px; cursor: pointer; background: #fff;">
                        <input type="checkbox" class="check-aluno" value="${aluno.id}" onchange="atualizarContadorNotificar()" style="width: 18px; height: 18px;">
                        <span style="font-size: 0.875rem; color: #333;">${aluno.nome}</span>
                    </label>
                `).join('');

                atualizarContadorNotificar();

            } catch (erro) {
                console.error("Erro ao carregar alunos", erro);
            }
        }

        modalDetalhe.showModal();
    }

    window.atualizarContadorNotificar = function() {
        const selecionados = document.querySelectorAll('.check-aluno:checked').length;
        document.getElementById('contador-selecionados').textContent = `${selecionados} selecionado(s)`;
        
        const btn = document.getElementById('btn-notificar-nao-fizeram');
        btn.disabled = selecionados === 0;
    }

    document.getElementById('btn-selecionar-todos').addEventListener('click', (e) => {
        const checkboxes = document.querySelectorAll('.check-aluno');
        const todosMarcados = Array.from(checkboxes).every(c => c.checked);
        
        checkboxes.forEach(c => c.checked = !todosMarcados);
        e.target.textContent = !todosMarcados ? 'Desmarcar todos' : 'Selecionar todos';
        atualizarContadorNotificar();
    });

    document.getElementById('btn-notificar-nao-fizeram').addEventListener('click', async () => {
        const selecionados = Array.from(document.querySelectorAll('.check-aluno:checked')).map(c => c.value);
        if (selecionados.length === 0) return;

        const btn = document.getElementById('btn-notificar-nao-fizeram');
        btn.textContent = "Notificando...";
        btn.disabled = true;

        try {
            await AtividadeService.notificarResponsaveis(idAtividadeDetalhe, selecionados);
            avisar(`${selecionados.length} responsáveis notificados com sucesso!`);
            modalDetalhe.close();
        } catch (erro) {
            console.error("Erro ao notificar", erro);
            alert("Erro ao enviar a notificação.");
            btn.textContent = "Notificar selecionados";
            btn.disabled = false;
        }
    });

    carregarAtividades(); 

})();