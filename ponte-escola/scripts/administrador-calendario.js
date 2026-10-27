// Tudo fica dentro de uma função que se executa sozinha (IIFE), para as variáveis
// não vazarem para o escopo global da página.
(function () {
    // --- Elementos da página (buscados uma vez só) ---
    // Grade de dias, títulos do mês e a coluna lateral com os eventos do dia.
    const grade = document.getElementById('calendario-grade');
    const tituloMes = document.getElementById('calendario-mes-atual');
    const sidebarMesNome = document.querySelector('.sidebar-mes-nome');
    const sidebarDia = document.querySelector('.sidebar-dia-numero');
    const listaDia = document.getElementById('lista-eventos-dia');
 
    // Modal e campos do formulário de criar/editar evento.
    const modal = document.getElementById('modal-evento');
    const form = document.getElementById('form-evento');
    const tituloModal = document.getElementById('modal-evento-titulo');
    const inputTitulo = document.getElementById('evento-titulo');
    const inputDescricao = document.getElementById('evento-descricao');
    const inputData = document.getElementById('evento-data');
    const inputTipo = document.getElementById('evento-tipo');
    const campoTurmas = document.querySelector('.campo-turmas');
    const btnExcluir = document.getElementById('btn-excluir-evento');
 
    // Nomes dos meses e rótulos de cada tipo de evento (usados na tela).
    const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const ROTULO_TIPO = { prova: 'Prova', reuniao: 'Reunião', evento: 'Evento', feriado: 'Feriado', atividade: 'Atividade', outro: 'Outro' };
 
    // --- Estado da tela ---
    // 'hoje' serve para destacar o dia atual; ano/mês definem o mês exibido.
    const hoje = new Date();
    let anoAtual = hoje.getFullYear();
    let mesAtual = hoje.getMonth();
    // Dia clicado na grade (formato YYYY-MM-DD).
    let diaSelecionado = dataParaISO(hoje);
    // Eventos do mês exibido, turmas cadastradas e o id do evento em edição
    // (null = criando um novo).
    let eventos = [];
    let turmas = [];
    let idEditando = null;
 
    // Busca as turmas no banco e cria um checkbox para cada uma dentro do modal.
    async function carregarTurmas() {
        try {
            turmas = await CalendarioService.listarTurmas();
        } catch (erro) {
            console.error('Erro ao carregar turmas:', erro);
        }
        // O checkbox "Todas as turmas" já existe no HTML; os das turmas entram antes dele.
        // Os checkboxes antigos são removidos para não duplicar ao recarregar.
        const todas = campoTurmas.querySelector('.checkbox-todas');
        campoTurmas.querySelectorAll('.checkbox-turma:not(.checkbox-todas)').forEach(el => el.remove());
        turmas.forEach(t => {
            const label = document.createElement('label');
            label.className = 'checkbox-turma';
            // escaparHtml evita que o nome da turma seja interpretado como HTML.
            label.innerHTML = `<input type="checkbox" value="${t.id}" class="check-turma"> ${escaparHtml(t.nome)}`;
            campoTurmas.insertBefore(label, todas);
        });
    }
 
    // Retorna os checkboxes das turmas (sem o "Todas as turmas") como array.
    function checksTurmas() {
        return [...campoTurmas.querySelectorAll('.check-turma')];
    }
 
    // Marcar/desmarcar "Todas as turmas" marca/desmarca todas as demais.
    document.getElementById('todas-turmas').addEventListener('change', (e) => {
        checksTurmas().forEach(c => { c.checked = e.target.checked; });
    });
    // Se o usuário marcar todas as turmas manualmente, o "Todas" também fica marcado;
    // se desmarcar uma, ele desmarca.
    campoTurmas.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-turma')) {
            document.getElementById('todas-turmas').checked = checksTurmas().every(c => c.checked);
        }
    });
 
    // Busca no banco os eventos do mês exibido (do dia 1 ao último dia) e redesenha a tela.
    async function carregarEventos() {
        const inicio = dataParaISO(new Date(anoAtual, mesAtual, 1));
        // Dia 0 do mês seguinte = último dia do mês atual.
        const fim = dataParaISO(new Date(anoAtual, mesAtual + 1, 0));
        try {
            eventos = await CalendarioService.listarPeriodo(inicio, fim);
        } catch (erro) {
            console.error('Erro ao carregar eventos:', erro);
            eventos = [];
            mostrarAviso('Não foi possível carregar os eventos.');
        }
        renderizar();
    }
 
    // Filtra os eventos que acontecem em uma data específica.
    function eventosDoDia(iso) {
        return eventos.filter(e => e.data === iso);
    }
 
    // Desenha o mês: títulos, grade de dias e a coluna lateral.
    function renderizar() {
        const rotuloMes = `${MESES[mesAtual]} ${anoAtual}`;
        tituloMes.textContent = rotuloMes;
        sidebarMesNome.textContent = rotuloMes;
 
        const primeiro = new Date(anoAtual, mesAtual, 1);
        const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
        // Quantos quadradinhos vazios vêm antes do dia 1.
        // getDay() começa no domingo (0), então (dia + 6) % 7 faz a semana começar na segunda.
        const vazios = (primeiro.getDay() + 6) % 7; // semana começa na segunda
 
        // Monta a grade: primeiro os espaços vazios, depois um quadrado para cada dia.
        let html = '';
        for (let i = 0; i < vazios; i++) html += '<div class="dia vazio"></div>';
        const iso0 = dataParaISO(hoje);
        for (let d = 1; d <= diasNoMes; d++) {
            const iso = dataParaISO(new Date(anoAtual, mesAtual, d));
            const qtd = eventosDoDia(iso).length;
            // Classes CSS do dia: selecionado, hoje, com 1 evento ou com vários.
            const classes = ['dia'];
            if (iso === diaSelecionado) classes.push('selecionado');
            if (iso === iso0) classes.push('hoje');
            if (qtd) classes.push('com-evento');
            if (qtd > 1) classes.push('com-multiplos-eventos');
            html += `<div class="${classes.join(' ')}" data-data="${iso}">${d}</div>`;
        }
        grade.innerHTML = html;
        renderizarSidebar();
    }
 
    // Texto com as turmas do evento ("Todas as turmas" ou os nomes separados por vírgula).
    function nomesTurmas(ev) {
        if (ev.todas_turmas) return 'Todas as turmas';
        const nomes = (ev.eventos_turmas || []).map(et => et.turma?.nome).filter(Boolean);
        return nomes.length ? nomes.join(', ') : 'Sem turma definida';
    }
 
    // Mostra na lateral a data selecionada e os eventos desse dia.
    function renderizarSidebar() {
        const [a, m, d] = diaSelecionado.split('-');
        sidebarDia.textContent = `${d}/${m}/${a}`;
 
        const doDia = eventosDoDia(diaSelecionado);
        if (!doDia.length) {
            listaDia.innerHTML = '<p class="lista-vazia">Nenhum evento neste dia.</p>';
            return;
        }
        listaDia.innerHTML = doDia.map(ev => `
            <div class="card-evento-sidebar ${escaparHtml(ev.tipo)}" data-id="${ev.id}" title="Clique para editar">
                <p class="card-evento-titulo">${escaparHtml(ev.titulo)}</p>
                <p class="card-evento-turmas">${ROTULO_TIPO[ev.tipo] || 'Evento'} · ${escaparHtml(nomesTurmas(ev))}</p>
                ${ev.descricao ? `<p class="card-evento-turmas">${escaparHtml(ev.descricao)}</p>` : ''}
            </div>`).join('');
    }
 
    // Clique em um dia da grade: seleciona o dia e redesenha.
    // closet() garante que o clique em qualquer parte do quadrado funcione.
    grade.addEventListener('click', (e) => {
        const dia = e.target.closest('.dia[data-data]');
        if (!dia) return;
        diaSelecionado = dia.dataset.data;
        renderizar();
    });
 
    // Navega entre meses (delta = -1 anterior, +1 próximo).
    // new Date já ajusta virada de ano (ex.: mês 12 vira janeiro do ano seguinte).
    function mudarMes(delta) {
        const nova = new Date(anoAtual, mesAtual + delta, 1);
        anoAtual = nova.getFullYear();
        mesAtual = nova.getMonth();
        // mantém o dia selecionado dentro do mês exibido
        diaSelecionado = dataParaISO(new Date(anoAtual, mesAtual, 1));
        carregarEventos();
    }
    document.getElementById('btn-mes-anterior').addEventListener('click', () => mudarMes(-1));
    document.getElementById('btn-mes-proximo').addEventListener('click', () => mudarMes(1));
 
    // Abre o modal vazio (novo evento) ou preenchido (editar).
    // O botão Excluir só aparece quando está editando.
    function abrirModal(evento) {
        idEditando = evento ? evento.id : null;
        form.reset();
        checksTurmas().forEach(c => { c.checked = false; });
        tituloModal.textContent = evento ? 'Editar Evento' : 'Novo Evento';
        btnExcluir.hidden = !evento;
 
        // Edição: preenche os campos com os dados do evento e marca as turmas dele.
        if (evento) {
            inputTitulo.value = evento.titulo;
            inputDescricao.value = evento.descricao || '';
            inputData.value = evento.data;
            inputTipo.value = evento.tipo;
            const ids = (evento.eventos_turmas || []).map(et => String(et.turma_id));
            checksTurmas().forEach(c => { c.checked = evento.todas_turmas || ids.includes(c.value); });
            document.getElementById('todas-turmas').checked = !!evento.todas_turmas;
        // Novo evento: já vem com a data do dia selecionado.
        } else {
            inputData.value = diaSelecionado;
        }
        modal.showModal();
    }
 
    // Botões "Novo Evento" e "Cancelar".
    document.getElementById('btn-novo-evento').addEventListener('click', () => abrirModal(null));
    document.getElementById('btn-cancelar').addEventListener('click', () => modal.close());
 
    // Clicar em um evento da lateral abre o modal para editá-lo.
    listaDia.addEventListener('click', (e) => {
        const card = e.target.closest('.card-evento-sidebar');
        if (!card) return;
        abrirModal(eventos.find(ev => String(ev.id) === card.dataset.id));
    });
 
    // Salvar (criar ou atualizar) o evento.
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const marcadas = checksTurmas().filter(c => c.checked);
        // Se todas as turmas estão marcadas, o evento é salvo como "para todas as turmas".
        const todasTurmas = turmas.length > 0 && marcadas.length === turmas.length;
 
        // Exige pelo menos uma turma.
        if (!marcadas.length) {
            mostrarAviso('Selecione ao menos uma turma.');
            return;
        }
 
        try {
            await CalendarioService.salvar(idEditando, {
                titulo: inputTitulo.value.trim(),
                descricao: inputDescricao.value.trim(),
                data: inputData.value,
                tipo: inputTipo.value,
                todasTurmas,
                turmaIds: marcadas.map(c => c.value)
            });
            modal.close();
            mostrarAviso(idEditando ? 'Evento atualizado!' : 'Evento criado!');
 
            // vai para o mês do evento salvo
            const d = isoParaData(inputData.value);
            anoAtual = d.getFullYear();
            mesAtual = d.getMonth();
            diaSelecionado = inputData.value;
            carregarEventos();
        } catch (erro) {
            console.error('Erro ao salvar evento:', erro);
            mostrarAviso('Erro ao salvar o evento.');
        }
    });
 
    // Excluir o evento em edição, depois de confirmar com o usuário.
    btnExcluir.addEventListener('click', async () => {
        if (!idEditando || !confirm('Excluir este evento?')) return;
        try {
            await CalendarioService.excluir(idEditando);
            modal.close();
            mostrarAviso('Evento excluído.');
            carregarEventos();
        } catch (erro) {
            console.error('Erro ao excluir evento:', erro);
            mostrarAviso('Erro ao excluir o evento.');
        }
    });
 
    // Início da página: carrega as turmas primeiro (para o modal) e depois os eventos.
    carregarTurmas().then(carregarEventos);
})();