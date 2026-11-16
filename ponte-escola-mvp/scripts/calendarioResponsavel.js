document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // MESMOS TIPOS DO CALENDÁRIO DA COORDENAÇÃO
    const ROTULO_TIPO = {
        prova: 'Prova', reuniao: 'Reunião', evento: 'Evento', feriado: 'Feriado', atividade: 'Atividade',
        outro: 'Outro', aviso: 'Aviso', passeio: 'Passeio', entrega: 'Entrega de atividade'
    };

    const hoje = new Date();
    let anoAtual = hoje.getFullYear();
    let mesAtual = hoje.getMonth();
    let diaSelecionado = dataParaISO(hoje);

    let filho = null;
    let filhos = [];
    let eventos = [];

    // ---------------- FORMATAÇÕES ----------------

    // CLASSE DE COR DO TIPO (TIPO DESCONHECIDO USA "outro")
    function classeTipo(tipo) {
        return `tipo-${ROTULO_TIPO[tipo] ? tipo : 'outro'}`;
    }

    function eventosDoDia(iso) {
        return eventos.filter(e => e.data === iso);
    }

    // ---------------- CARREGAMENTO ----------------

    async function carregarMes() {
        document.getElementById('calendario-mes-atual').textContent = `${MESES[mesAtual]} ${anoAtual}`;

        const inicio = dataParaISO(new Date(anoAtual, mesAtual, 1));
        const fim = dataParaISO(new Date(anoAtual, mesAtual + 1, 0));

        try {
            eventos = await CalendarioResponsavelService.listarPeriodo(inicio, fim, filho.turma_id);
        } catch (erro) {
            console.error("Erro ao carregar o calendário:", erro);
            eventos = [];
            mostrarAviso("Não foi possível carregar os eventos.");
        }

        renderizarGrade();
        renderizarDia();
        renderizarMes();
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarGrade() {
        const grade = document.getElementById('calendario-grade');
        const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
        const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();
        const hojeISO = dataParaISO(hoje);

        // CÉLULAS VAZIAS ATÉ O PRIMEIRO DIA DO MÊS
        let html = '<span class="dia vazio"></span>'.repeat(primeiroDiaSemana);

        for (let dia = 1; dia <= totalDias; dia++) {
            const iso = dataParaISO(new Date(anoAtual, mesAtual, dia));
            const doDia = eventosDoDia(iso);

            // ATÉ 3 PONTINHOS COLORIDOS, UM POR TIPO DE EVENTO
            const pontos = doDia.slice(0, 3).map(e => `<i class="ponto ${classeTipo(e.tipo)}"></i>`).join("");

            html += `
                <button class="dia ${iso === hojeISO ? 'hoje' : ''} ${iso === diaSelecionado ? 'selecionado' : ''}" data-data="${iso}">
                    <span>${dia}</span>
                    <div class="pontos">${pontos}</div>
                </button>
            `;
        }

        grade.innerHTML = html;

        grade.querySelectorAll('.dia[data-data]').forEach(botao => {
            botao.addEventListener("click", () => {
                diaSelecionado = botao.dataset.data;
                renderizarGrade();
                renderizarDia();
            });
        });
    }

    function cartaoEvento(e, mostrarData = false) {
        return `
            <div class="evento-item ${classeTipo(e.tipo)}" ${mostrarData ? `data-data="${e.data}"` : ''}>
                <div class="evento-item-info">
                    <span class="evento-item-tipo">${ROTULO_TIPO[e.tipo] || 'Outro'}${mostrarData ? ` · ${e.data.slice(8, 10)}/${e.data.slice(5, 7)}` : ''}</span>
                    <strong>${escaparHtml(e.titulo)}</strong>
                    ${e.descricao && !mostrarData ? `<p>${escaparHtml(e.descricao)}</p>` : ''}
                </div>
            </div>
        `;
    }

    // PAINEL DO DIA CLICADO
    function renderizarDia() {
        const data = isoParaData(diaSelecionado);
        document.getElementById('dia-numero').textContent = data.getDate();
        document.getElementById('dia-semana').textContent = data.toLocaleDateString('pt-BR', { weekday: 'long' });
        document.getElementById('dia-mes').textContent = `${MESES[data.getMonth()]} de ${data.getFullYear()}`;

        const doDia = eventosDoDia(diaSelecionado);
        document.getElementById('lista-eventos-dia').innerHTML = doDia.length === 0
            ? `<p class="painel-vazio">Nenhum evento neste dia.</p>`
            : doDia.map(e => cartaoEvento(e)).join("");
    }

    // LISTA RESUMIDA DE TODOS OS EVENTOS DO MÊS (CLICAR SELECIONA O DIA)
    function renderizarMes() {
        const container = document.getElementById('lista-eventos-mes');

        container.innerHTML = eventos.length === 0
            ? `<p class="painel-vazio">Nenhum evento em ${MESES[mesAtual].toLowerCase()}.</p>`
            : eventos.map(e => cartaoEvento(e, true)).join("");

        container.querySelectorAll('.evento-item[data-data]').forEach(item => {
            item.addEventListener("click", () => {
                diaSelecionado = item.dataset.data;
                renderizarGrade();
                renderizarDia();
            });
        });
    }

    function renderizarLegenda() {
        document.getElementById('calendario-legenda').innerHTML = Object.entries(ROTULO_TIPO)
            .map(([tipo, rotulo]) => `<span><i class="ponto ${classeTipo(tipo)}"></i>${rotulo}</span>`)
            .join("");
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.getElementById('btn-mes-anterior').addEventListener("click", () => {
        mesAtual--;
        if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
        carregarMes();
    });

    document.getElementById('btn-mes-proximo').addEventListener("click", () => {
        mesAtual++;
        if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
        carregarMes();
    });

    // VOLTA PARA O MÊS ATUAL E SELECIONA O DIA DE HOJE
    document.getElementById('btn-hoje').addEventListener("click", () => {
        anoAtual = hoje.getFullYear();
        mesAtual = hoje.getMonth();
        diaSelecionado = dataParaISO(hoje);
        carregarMes();
    });

    try {
        ({ filho, filhos } = await obterFilhoSelecionado(idLogado));
    } catch (erro) {
        console.error("Erro ao buscar filhos do responsável:", erro);
    }

    if (!filho) {
        document.getElementById('subtitulo-calendario').textContent = "Nenhum aluno vinculado a este responsável.";
        return;
    }

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    renderizarLegenda();
    carregarMes();
});
