document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    const DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

    // 'chave' É O NOME DA COLUNA NO BANCO
    const REFEICOES = [
        { chave: 'cafe', titulo: "Café da manhã", emoji: "🥐" },
        { chave: 'almoco', titulo: "Almoço", emoji: "🍛" },
        { chave: 'lanche', titulo: "Lanche da tarde", emoji: "🍎" }
    ];

    // SEGUNDA-FEIRA DA SEMANA EXIBIDA (FIM DE SEMANA JÁ MOSTRA A PRÓXIMA)
    let segundaAtual = segundaDaSemana(new Date());
    const segundaDeHoje = segundaDaSemana(new Date());

    // ---------------- FORMATAÇÕES ----------------

    function segundaDaSemana(data) {
        const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
        const diaSemana = d.getDay(); // 0 = domingo
        const deslocamento = diaSemana === 0 ? 1 : diaSemana === 6 ? 2 : 1 - diaSemana;
        d.setDate(d.getDate() + deslocamento);
        return d;
    }

    function somarDias(data, n) {
        const d = new Date(data);
        d.setDate(d.getDate() + n);
        return d;
    }

    // EX: "12/09"
    function formatarCurto(d) {
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // "Esta semana", "Próxima semana", "Semana passada" OU O INTERVALO
    function nomeDaSemana() {
        const diferenca = Math.round((segundaAtual - segundaDeHoje) / (7 * 86400000));
        if (diferenca === 0) return "Esta semana";
        if (diferenca === 1) return "Próxima semana";
        if (diferenca === -1) return "Semana passada";
        return "Outra semana";
    }

    // ---------------- CARREGAMENTO ----------------

    async function carregarSemana() {
        const container = document.getElementById('cardapio-semana');

        document.getElementById('texto-semana').textContent = nomeDaSemana();
        document.getElementById('intervalo-semana').textContent =
            `${formatarCurto(segundaAtual)} a ${formatarCurto(somarDias(segundaAtual, 4))}`;

        container.innerHTML = `<p class="painel-vazio">Carregando cardápio...</p>`;

        try {
            const linhas = await CardapioService.listarPeriodo(
                dataParaISO(segundaAtual),
                dataParaISO(somarDias(segundaAtual, 4))
            );

            // ORGANIZA POR DATA PARA ACHAR O CARDÁPIO DE CADA DIA RÁPIDO
            const porData = {};
            linhas.forEach(l => { porData[l.data] = l; });

            renderizarDestaque(porData);
            renderizarSemana(porData);
        } catch (erro) {
            console.error("Erro ao carregar o cardápio:", erro);
            container.innerHTML = `<p class="painel-vazio">Erro ao carregar o cardápio.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    // CARD GRANDE COM AS 3 REFEIÇÕES DE HOJE (SÓ NA SEMANA ATUAL, DE SEGUNDA A SEXTA)
    function renderizarDestaque(porData) {
        const container = document.getElementById('destaque-cardapio');
        const hojeISO = dataParaISO(new Date());
        const cardapioHoje = porData[hojeISO];
        const ehDiaUtil = new Date().getDay() >= 1 && new Date().getDay() <= 5;

        container.hidden = !(ehDiaUtil && dataParaISO(segundaAtual) === dataParaISO(segundaDeHoje));
        if (container.hidden) return;

        if (!cardapioHoje) {
            container.innerHTML = `
                <div class="destaque-cardapio-titulo">
                    <span class="destaque-selo">Hoje</span>
                    <h3>Cardápio de hoje ainda não foi informado</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="destaque-cardapio-titulo">
                <span class="destaque-selo">Hoje</span>
                <h3>O que vai ter na escola hoje</h3>
            </div>
            <div class="destaque-refeicoes">
                ${REFEICOES.map(r => `
                    <div class="destaque-refeicao">
                        <span class="destaque-refeicao-emoji">${r.emoji}</span>
                        <small>${r.titulo}</small>
                        <strong>${escaparHtml(cardapioHoje[r.chave] || "Não informado")}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function renderizarSemana(porData) {
        const container = document.getElementById('cardapio-semana');
        const hojeISO = dataParaISO(new Date());

        container.innerHTML = DIAS.map((nomeDia, i) => {
            const data = somarDias(segundaAtual, i);
            const iso = dataParaISO(data);
            const cardapio = porData[iso];
            const ehHoje = iso === hojeISO;

            const refeicoes = cardapio
                ? REFEICOES.map(r => `
                    <div class="refeicao">
                        <span class="refeicao-emoji">${r.emoji}</span>
                        <div>
                            <small>${r.titulo}</small>
                            <p class="${cardapio[r.chave] ? '' : 'nao-informado'}">${escaparHtml(cardapio[r.chave] || "Não informado")}</p>
                        </div>
                    </div>
                `).join("")
                : `<p class="painel-vazio">Cardápio não informado.</p>`;

            return `
                <article class="cartao-dia ${ehHoje ? 'hoje' : ''}">
                    <div class="cartao-dia-topo">
                        <div>
                            <strong>${nomeDia}</strong>
                            <span>${formatarCurto(data)}</span>
                        </div>
                        ${ehHoje ? '<span class="selo-hoje">Hoje</span>' : ''}
                    </div>
                    ${refeicoes}
                </article>
            `;
        }).join("");
    }

    // ---------------- INICIALIZAÇÃO ----------------

    document.getElementById('btn-semana-anterior').addEventListener("click", () => {
        segundaAtual = somarDias(segundaAtual, -7);
        carregarSemana();
    });

    document.getElementById('btn-semana-proxima').addEventListener("click", () => {
        segundaAtual = somarDias(segundaAtual, 7);
        carregarSemana();
    });

    // CLICAR NO MEIO VOLTA PARA A SEMANA ATUAL
    document.getElementById('btn-semana-atual').addEventListener("click", () => {
        segundaAtual = segundaDaSemana(new Date());
        carregarSemana();
    });

    carregarSemana();
});
