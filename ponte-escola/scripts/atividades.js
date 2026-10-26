(function () {
    const listaEl = document.getElementById('lista-atividades');
    const buscaEl = document.getElementById('busca-atividades');
    const filtrosEl = document.getElementById('filtros-atividades');
    const modalEl = document.getElementById('modal-atividade');
    
    //MUDEI: Adicionado a variável do modal de detalhes que estava faltando
    const modalDetalhe = document.getElementById('modal-detalhe-atividade'); 
    
    const formEl = document.getElementById('form-atividade');
    const avisoEl = document.getElementById('aviso-flutuante');

    let filtro = 'todas';
    let dadosAtividades = []; //MUDEI
    let idAtividadeEditando = null; //MUDEI

    const iconeRelogio = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
    const iconeSeta = '<svg class="item-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

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

    function renderizarResumo() { //MUDEI
        // const todas = AtividadeService.listar(); //MUDEI 
        const confirmadas = dadosAtividades.filter(a => a.lidas === a.total && a.total > 0).length;
        const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Jardim II — Turma A";

        document.getElementById('subtitulo-atividades-turma').textContent =
            `${dadosAtividades.length} ${dadosAtividades.length === 1 ? 'atividade' : 'atividades'} · ${turmaNome}`;
        document.getElementById('stat-total').textContent = dadosAtividades.length;
        document.getElementById('stat-aguardando').textContent = dadosAtividades.length - confirmadas;
        document.getElementById('stat-confirmadas').textContent = confirmadas;
    }

    function renderizar() {
        // const todas = AtividadeService.listar(); //MUDEI 
        const termo = buscaEl.value.trim().toLowerCase();

        renderizarResumo();

        const exibidas = dadosAtividades.filter(a => { //MUDEI
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
            const pct = a.total > 0 ? Math.round((a.lidas / a.total) * 100) : 0;
            
            //MUDEI
            return `
            <div class="card-aviso" 
                 onclick="abrirDetalheAtividade(${a.id})"
                 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #eee;">
                
                <div class="aviso-info">
                    <span class="badge-tipo badge-comunicado">Atividade</span>
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

                    <!--MUDEI: Botão de 3 pontinhos-->
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

    //MUDEI
    async function carregarAtividades() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) {
            listaEl.innerHTML = '<p class="lista-vazia">Selecione uma turma no topo.</p>';
            return;
        }
        
        listaEl.innerHTML = '<p class="lista-vazia">Carregando...</p>';
        
        try {
            dadosAtividades = await AtividadeService.listarPorTurma(turmaId); //MUDEI
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

    //MUDEI
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
        idAtividadeEditando = null; //MUDEI
        formEl.reset();
        document.getElementById('modal-titulo').textContent = "Nova atividade"; //MUDEI
        formEl.querySelector('button[type="submit"]').textContent = "Publicar atividade"; //MUDEI
        formEl.prazo.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        modalEl.showModal();
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => modalEl.close());
    document.getElementById('btn-fechar-modal').addEventListener('click', () => modalEl.close()); //MUDEI

    modalEl.addEventListener('click', e => {
        if (e.target === modalEl) modalEl.close();
    });

    //MUDEI
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

    formEl.addEventListener('submit', async e => { //MUDEI
        e.preventDefault();
        
        const turmaId = localStorage.getItem('turmaVisualizadaId'); //MUDEI
        const autorId = localStorage.getItem('usuarioLogadoId'); 

        if (!turmaId) { alert("Selecione uma turma no topo."); return; } //MUDEI

        try { //MUDEI
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
            carregarAtividades(); //MUDEI
        } catch (erro) { //MUDEI
            console.error(erro);
            alert("Erro ao salvar atividade.");
        }
    });

    //MUDEI
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

    //MUDEI
    document.getElementById('btn-fechar-detalhe').addEventListener('click', () => modalDetalhe.close());
    modalDetalhe.addEventListener('click', (e) => {
        if (e.target === modalDetalhe) modalDetalhe.close();
    });

    window.abrirDetalheAtividade = function(id) {
        const ativ = dadosAtividades.find(a => a.id === id);
        if (!ativ) return;

        document.getElementById('detalhe-titulo').textContent = ativ.titulo;
        document.getElementById('detalhe-prazo').textContent = ativ.prazo;
        document.getElementById('detalhe-descricao').textContent = ativ.descricao;
        document.getElementById('detalhe-leituras').textContent = `${ativ.lidas}/${ativ.total}`;

        const pct = ativ.total > 0 ? Math.round((ativ.lidas / ativ.total) * 100) : 0;
        document.getElementById('detalhe-barra').style.width = `${pct}%`;
        
        const statusTexto = document.getElementById('detalhe-status-texto');
        statusTexto.innerHTML = `${ativ.lidas}/${ativ.total} <span>${pct >= 100 ? '✓' : '⏱'}</span>`;
        
        if (pct >= 100) {
            document.getElementById('detalhe-barra').style.background = 'var(--color-success)';
            statusTexto.className = 'progresso-texto completo';
        } else {
            document.getElementById('detalhe-barra').style.background = 'var(--color-success)';
            statusTexto.className = 'progresso-texto';
        }

        modalDetalhe.showModal();
    }

    // renderizar(); 
    carregarAtividades(); //MUDEI

})();