// A função se executa sozinha (IIFE) para não poluir o escopo global.
(function () {
    // --- Elementos da página ---
    // Área dos cards, subtítulo com a semana, modal de edição e o campo de data da semana.
    const container = document.getElementById('cardapio-semana');
    const subtitulo = document.getElementById('subtitulo-cardapio');
    const modal = document.getElementById('modal-cardapio');
    const form = document.getElementById('form-cardapio');
    const inputSemana = document.getElementById('semana-inicio');

    // Dias úteis da semana. 'prefixo' liga cada dia aos ids dos campos do modal
    // (ex.: seg-cafe, seg-almoco, seg-lanche).
    const DIAS = [
        { nome: 'Segunda-feira', prefixo: 'seg' },
        { nome: 'Terça-feira', prefixo: 'ter' },
        { nome: 'Quarta-feira', prefixo: 'qua' },
        { nome: 'Quinta-feira', prefixo: 'qui' },
        { nome: 'Sexta-feira', prefixo: 'sex' }
    ];
    // Refeições do dia: 'chave' é o nome da coluna no banco; 'titulo' é o texto exibido.
    const REFEICOES = [
        { chave: 'cafe', titulo: 'Café da manhã' },
        { chave: 'almoco', titulo: 'Almoço' },
        { chave: 'lanche', titulo: 'Lanche da tarde' }
    ];

    // Segunda-feira da semana que está sendo exibida.
    let segundaAtual = segundaDaSemana(new Date());

    // Devolve a segunda-feira da semana de uma data qualquer.
    // Sábado e domingo apontam para a próxima semana (que é a que interessa na escola).
    function segundaDaSemana(data) {
        const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
        const diaSemana = d.getDay(); // 0 = domingo
        // sábado e domingo mostram a próxima semana
        // Quantos dias somar/subtrair para chegar na segunda.
        // domingo (0) -> +1, sábado (6) -> +2, seg-sex -> volta até a segunda.
        const deslocamento = diaSemana === 0 ? 1 : diaSemana === 6 ? 2 : 1 - diaSemana;
        d.setDate(d.getDate() + deslocamento);
        return d;
    }

    // Soma (ou subtrai, com número negativo) dias a uma data, sem alterar a original.
    function somarDias(data, n) {
        const d = new Date(data);
        d.setDate(d.getDate() + n);
        return d;
    }

    // Formata uma data como DD/MM.
    function formatarCurto(d) {
        // HTML de um card de dia. Refeições sem texto aparecem como "Não informado".
        // escaparHtml protege contra texto digitado com tags HTML.
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // Busca no banco os dias da semana (segunda a sexta) e organiza por data,
    // para achar o cardápio de cada dia rapidamente.
    async function buscarSemana(segunda) {
        const linhas = await CardapioService.listarPeriodo(dataParaISO(segunda), dataParaISO(somarDias(segunda, 4)));
        const porData = {};
        linhas.forEach(l => { porData[l.data] = l; });
        return porData;
    }

    // Mostra a semana atual: atualiza o subtítulo e desenha um card por dia.
    async function carregar() {
        const sexta = somarDias(segundaAtual, 4);
        subtitulo.textContent = `Semana de ${formatarCurto(segundaAtual)} a ${formatarCurto(sexta)}`;
        container.innerHTML = '<p class="lista-vazia">Carregando...</p>';

        try {
            const porData = await buscarSemana(segundaAtual);
            container.innerHTML = DIAS.map((dia, i) => {
                const data = somarDias(segundaAtual, i);
                const registro = porData[dataParaISO(data)] || {};
                return `
                    <article class="card-dia">
                        <header class="card-dia-cabecalho">
                            <h3>${dia.nome}</h3>
                            <span class="card-dia-data">${formatarCurto(data)}</span>
                        </header>
                        <div class="card-dia-refeicoes">
                            ${REFEICOES.map(r => `
                                <div class="refeicao">
                                    <span class="refeicao-titulo">${r.titulo}</span>
                                    <p class="refeicao-descricao">${registro[r.chave] ? escaparHtml(registro[r.chave]) : '<em>Não informado</em>'}</p>
                                </div>`).join('')}
                        </div>
                    </article>`;
            }).join('');
        } catch (erro) {
            console.error('Erro ao carregar cardápio:', erro);
            container.innerHTML = '<p class="lista-vazia">Não foi possível carregar o cardápio.</p>';
        }
    }

    // Preenche o modal com o cardápio da semana escolhida (campos vazios se não houver).
    async function preencherModal(segunda) {
        inputSemana.value = dataParaISO(segunda);
        let porData = {};
        try {
            porData = await buscarSemana(segunda);
        } catch (erro) {
            console.error('Erro ao buscar semana:', erro);
        }
        DIAS.forEach((dia, i) => {
            const registro = porData[dataParaISO(somarDias(segunda, i))] || {};
            REFEICOES.forEach(r => {
                document.getElementById(`${dia.prefixo}-${r.chave}`).value = registro[r.chave] || '';
            });
        });
    }

    // Botão "Editar Cardápio": carrega os dados da semana e abre o modal.
    document.getElementById('btn-editar-cardapio').addEventListener('click', async () => {
        await preencherModal(segundaAtual);
        modal.showModal();
    });

    // Botões de navegação: voltam/avançam uma semana (7 dias) e recarregam.
    document.getElementById('btn-semana-anterior').addEventListener('click', () => {
        segundaAtual = somarDias(segundaAtual, -7);
        carregar();
    });
    document.getElementById('btn-semana-proxima').addEventListener('click', () => {
        segundaAtual = somarDias(segundaAtual, 7);
        carregar();
    });

    // Ao escolher outra data, o modal passa a editar a semana daquela data
    inputSemana.addEventListener('change', () => {
        if (!inputSemana.value) return;
        const segunda = segundaDaSemana(isoParaData(inputSemana.value));
        preencherModal(segunda);
    });

    // Fecha o modal sem salvar.
    document.getElementById('btn-cancelar').addEventListener('click', () => modal.close());

    // Salvar o cardápio da semana.
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const segunda = segundaDaSemana(isoParaData(inputSemana.value));

        // Monta uma lista com os 5 dias e o texto de cada refeição.
        // Campo vazio vira null (o serviço remove dias totalmente vazios).
        const dias = DIAS.map((dia, i) => ({
            data: dataParaISO(somarDias(segunda, i)),
            cafe: document.getElementById(`${dia.prefixo}-cafe`).value.trim() || null,
            almoco: document.getElementById(`${dia.prefixo}-almoco`).value.trim() || null,
            lanche: document.getElementById(`${dia.prefixo}-lanche`).value.trim() || null
        }));

        try {
            await CardapioService.salvarSemana(dias);
            segundaAtual = segunda;
            modal.close();
            mostrarAviso('Cardápio salvo!');
            carregar();
        } catch (erro) {
            console.error('Erro ao salvar cardápio:', erro);
            mostrarAviso('Erro ao salvar o cardápio.');
        }
    });

    carregar();
})();