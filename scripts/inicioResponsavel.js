document.addEventListener("DOMContentLoaded", async () => {

    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) return; // A barra do topo já manda para o login

    let filho = null;
    let filhos = [];
    let autorizacoesPendentes = [];
    let atualizacoes = [];
    let autorizacaoAberta = null;
    let totalNovidades = 0;

    // PONTO VERMELHO NO SINO QUANDO HÁ NOVIDADE
    function atualizarPontoNotificacao() {
        const ponto = document.getElementById('topo-ponto-notificacao');
        if (ponto) ponto.hidden = totalNovidades === 0;
    }

    // A barra do topo é desenhada depois de buscar o responsável, então espera ela ficar pronta
    document.addEventListener("barraTopoResponsavelPronta", atualizarPontoNotificacao);

    document.addEventListener("click", (e) => {
        if (!e.target.closest('#btn-notificacoes')) return;
        mostrarAviso(totalNovidades === 0
            ? "Você não tem novidades."
            : `Você tem ${plural(totalNovidades, "novidade", "novidades")}.`);
    });

    // ---------------- FORMATAÇÕES ----------------

    // BOM DIA / BOA TARDE / BOA NOITE
    function saudacaoPorHora() {
        const hora = new Date().getHours();
        if (hora < 12) return "Bom dia";
        if (hora < 18) return "Boa tarde";
        return "Boa noite";
    }

    // EX: "Sexta-feira, 12 de setembro"
    function formatarDataExtensa(data) {
        const texto = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    // EX: "26 de setembro"
    function formatarDiaMes(iso) {
        return isoParaData(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    // EX: "Hoje, 08:15" / "Ontem, 16:20" / "09/09, 10:30"
    function formatarDataHora(dataISO) {
        const data = new Date(dataISO);
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const hoje = new Date();
        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
        if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
        return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hora}`;
    }

    // QUANTOS DIAS FALTAM ATÉ A DATA (YYYY-MM-DD)
    function diasAte(iso) {
        const hoje = isoParaData(dataParaISO(new Date()));
        return Math.round((isoParaData(iso) - hoje) / 86400000);
    }

    // O PRAZO PARA RESPONDER É O prazo_limite (SE NÃO TIVER, USA A DATA DO EVENTO)
    function prazoDaAutorizacao(aut) {
        return aut.prazo_limite || aut.data_evento;
    }

    function textoVencimento(aut) {
        const iso = prazoDaAutorizacao(aut);
        if (!iso) return "A autorização digital aguarda sua resposta";
        const dias = diasAte(iso);
        if (dias < 0) return "O prazo desta autorização já passou";
        if (dias === 0) return "A autorização digital vence hoje";
        if (dias === 1) return "A autorização digital vence amanhã";
        return `A autorização digital vence em ${dias} dias`;
    }

    function textoVencimentoCurto(aut) {
        const iso = prazoDaAutorizacao(aut);
        if (!iso) return "Sem prazo definido";
        const dias = diasAte(iso);
        if (dias < 0) return "Prazo encerrado";
        if (dias === 0) return "Vence hoje";
        if (dias === 1) return "Vence amanhã";
        return `Vence em ${formatarDiaMes(iso)}`;
    }

    function plural(qtd, singular, pluralTexto) {
        return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
    }

    const NOMES_OCORRENCIA = {
        comportamental: "Acompanhamento em sala",
        saude: "Ocorrência de saúde",
        acidente: "Acidente na escola",
        alimentacao: "Ocorrência de alimentação"
    };

    // ---------------- CARREGAMENTO ----------------

    async function carregarPainel() {
        const turmaId = filho.turma_id;
        const hoje = new Date();
        const hojeISO = dataParaISO(hoje);
        const inicioMes = dataParaISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
        const fimMes = dataParaISO(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));

        try {
            const [pendentes, avisos, ocorrencias, atividades, eventos] = await Promise.all([
                InicioResponsavelService.listarAutorizacoesPendentes(filho.id, turmaId),
                InicioResponsavelService.listarAvisos(filho.id, turmaId),
                InicioResponsavelService.listarOcorrencias(filho.id),
                InicioResponsavelService.listarAtividadesAbertas(filho.id, turmaId, hojeISO),
                InicioResponsavelService.listarEventosPeriodo(turmaId, inicioMes, fimMes)
            ]);

            const autores = await InicioResponsavelService.buscarNomesAutores(
                [...avisos, ...ocorrencias].map(item => item.autor_id)
            );

            autorizacoesPendentes = pendentes;

            // JUNTA AVISOS E OCORRÊNCIAS NUMA LISTA SÓ, DO MAIS NOVO PARA O MAIS ANTIGO
            atualizacoes = [
                ...avisos.map(a => ({ ...a, origem: 'aviso', autor: autores[a.autor_id] })),
                ...ocorrencias.map(o => ({ ...o, origem: 'ocorrencia', autor: autores[o.autor_id] }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const avisosNovos = avisos.filter(a => !a.lido);
            const atividadesAbertas = atividades.filter(a => !a.lida);

            renderizarDestaque({
                novidades: avisosNovos.length,
                atividades: atividadesAbertas.length,
                eventos: eventos.length
            });

            renderizarAtalhos({
                novidades: avisosNovos.length,
                eventos: eventos.length,
                pendentes: pendentes.length
            });

            renderizarAtualizacoes();
            renderizarProximosPassos(pendentes, atividades, avisosNovos);

            totalNovidades = avisosNovos.length + pendentes.length;
            atualizarPontoNotificacao();

        } catch (erro) {
            console.error("Erro ao carregar o início do responsável:", erro);
            document.getElementById('lista-atualizacoes').innerHTML = `<p class="painel-vazio">Erro ao carregar as atualizações.</p>`;
            document.getElementById('lista-passos').innerHTML = `<p class="painel-vazio">Erro ao carregar os próximos passos.</p>`;
        }
    }

    // ---------------- RENDERIZAÇÃO ----------------

    function renderizarDestaque(numeros) {
        const container = document.getElementById('destaque-atencao');
        const proxima = autorizacoesPendentes[0];

        const blocoNumeros = `
            <div class="destaque-numeros">
                <div class="destaque-numero"><strong>${numeros.novidades}</strong><span>novidades</span></div>
                <div class="destaque-numero"><strong>${numeros.atividades}</strong><span>atividades</span></div>
                <div class="destaque-numero"><strong>${numeros.eventos}</strong><span>eventos</span></div>
            </div>
        `;

        if (proxima) {
            container.innerHTML = `
                <div class="destaque-texto">
                    <span class="destaque-selo">Precisa da sua atenção</span>
                    <h3>${escaparHtml(proxima.titulo)}</h3>
                    <p>${textoVencimento(proxima)}. Leva menos de um minuto para revisar as informações e responder.</p>
                    <button class="destaque-botao" id="btn-revisar-autorizacao">
                        Revisar autorização
                        <span class="icone-mascara" style="--icone: url('../assets/icons/arrow-right.svg')"></span>
                    </button>
                </div>
                ${blocoNumeros}
            `;

            document.getElementById('btn-revisar-autorizacao').addEventListener("click", () => abrirAutorizacao(proxima));
            return;
        }

        container.innerHTML = `
            <div class="destaque-texto">
                <span class="destaque-selo em-dia">Tudo em dia</span>
                <h3>Nenhuma pendência por aqui</h3>
                <p>Você não tem autorizações para responder agora. Veja os comunicados da turma para acompanhar a rotina.</p>
                <a class="destaque-botao" href="responsavel-comunicados.html">
                    Ver comunicados
                    <span class="icone-mascara" style="--icone: url('../assets/icons/arrow-right.svg')"></span>
                </a>
            </div>
            ${blocoNumeros}
        `;
    }

    function renderizarAtalhos(numeros) {
        document.getElementById('atalho-comunicados').textContent = plural(numeros.novidades, "novo", "novos");
        document.getElementById('atalho-calendario').textContent = plural(numeros.eventos, "evento", "eventos");
        const _atalhoAut = document.getElementById('atalho-autorizacoes'); if (_atalhoAut) _atalhoAut.textContent = plural(numeros.pendentes, "pendente", "pendentes");
    }

    function renderizarAtualizacoes() {
        const container = document.getElementById('lista-atualizacoes');
        const recentes = atualizacoes.slice(0, 4);

        if (recentes.length === 0) {
            container.innerHTML = `<p class="painel-vazio">Nenhuma atualização recente.</p>`;
            return;
        }

        container.innerHTML = recentes.map((item, indice) => {
            const ehOcorrencia = item.origem === 'ocorrencia';
            const ehEvento = item.tipo === 'evento' && !ehOcorrencia;

            const titulo = ehOcorrencia ? (NOMES_OCORRENCIA[item.tipo] || "Ocorrência") : item.titulo;
            const cor = ehOcorrencia ? 'vermelho' : (ehEvento ? 'roxo' : 'azul');
            const icone = ehOcorrencia ? 'triangle-alert' : (ehEvento ? 'calendar-days' : 'megaphone');
            const autor = item.autor || "Coordenação Pedagógica";

            return `
                <button class="item-atualizacao" data-indice="${indice}">
                    <div class="icone-atualizacao ${cor}">
                        <span class="icone-mascara" style="--icone: url('../assets/icons/${icone}.svg')"></span>
                    </div>
                    <div class="item-atualizacao-info">
                        <p class="item-atualizacao-titulo">
                            ${escaparHtml(titulo)}
                            ${item.lido ? '' : '<span class="ponto-novo" title="Novo"></span>'}
                        </p>
                        <p class="item-atualizacao-texto">${escaparHtml(item.descricao)}</p>
                        <p class="item-atualizacao-meta">${escaparHtml(autor)} · ${formatarDataHora(item.created_at)}</p>
                    </div>
                    <img src="../assets/icons/chevron-right.svg" alt="" class="item-atualizacao-seta">
                </button>
            `;
        }).join("");

        container.querySelectorAll('.item-atualizacao').forEach(botao => {
            botao.addEventListener("click", () => abrirAtualizacao(recentes[botao.dataset.indice]));
        });
    }

    function renderizarProximosPassos(pendentes, atividades, avisosNovos) {
        const container = document.getElementById('lista-passos');
        const selo = document.getElementById('selo-pendentes');

        // PRIMEIRO O QUE FALTA FAZER, DEPOIS O QUE JÁ FOI FEITO
        const passos = [
            ...pendentes.map(aut => ({
                tipo: 'autorizacao', icone: 'file-check', concluido: false,
                titulo: `Autorizar ${aut.titulo}`, detalhe: textoVencimentoCurto(aut), dado: aut
            })),
            ...atividades.filter(a => !a.lida).map(ativ => ({
                tipo: 'atividade', icone: 'clock', concluido: false,
                titulo: ativ.titulo, detalhe: `Para ${formatarDiaMes(ativ.prazo)}`, dado: ativ
            })),
            ...avisosNovos.slice(0, 2).map(aviso => ({
                tipo: 'aviso', icone: 'circle-check', concluido: false,
                titulo: "Confirmar leitura", detalhe: aviso.titulo, dado: aviso
            })),
            ...atividades.filter(a => a.lida).map(ativ => ({
                tipo: 'atividade', icone: 'circle-check', concluido: true,
                titulo: ativ.titulo, detalhe: `Para ${formatarDiaMes(ativ.prazo)}`, dado: ativ
            }))
        ];

        const totalPendentes = passos.filter(p => !p.concluido).length;
        selo.textContent = totalPendentes === 0 ? "Tudo em dia" : plural(totalPendentes, "pendente", "pendentes");
        selo.classList.toggle('em-dia', totalPendentes === 0);

        if (passos.length === 0) {
            container.innerHTML = `<p class="painel-vazio">Nada para fazer por enquanto. 🎉</p>`;
            return;
        }

        const exibidos = passos.slice(0, 4);

        container.innerHTML = exibidos.map((passo, indice) => `
            <button class="item-passo ${passo.concluido ? 'concluido' : ''}" data-indice="${indice}" ${passo.concluido ? 'disabled' : ''}>
                <div class="icone-passo">
                    <span class="icone-mascara" style="--icone: url('../assets/icons/${passo.icone}.svg')"></span>
                </div>
                <div class="passo-texto">
                    <strong>${escaparHtml(passo.titulo)}</strong>
                    <span>${escaparHtml(passo.detalhe)}</span>
                </div>
            </button>
        `).join("");

        container.querySelectorAll('.item-passo').forEach(botao => {
            botao.addEventListener("click", () => executarPasso(exibidos[botao.dataset.indice]));
        });
    }

    // ---------------- AÇÕES ----------------

    // CLICAR NUM PASSO: ABRE A AUTORIZAÇÃO, O AVISO OU CONFIRMA A ATIVIDADE
    async function executarPasso(passo) {
        if (passo.tipo === 'autorizacao') {
            abrirAutorizacao(passo.dado);
        } else if (passo.tipo === 'aviso') {
            abrirAtualizacao({ ...passo.dado, origem: 'aviso', autor: null });
        } else if (passo.tipo === 'atividade') {
            try {
                const { error } = await banco
                    .from('atividades_lidas')
                    .insert([{ atividade_id: passo.dado.id, aluno_id: filho.id }]);
                if (error && error.code !== '23505') throw error;

                mostrarAviso("Atividade confirmada!");
                carregarPainel();
            } catch (erro) {
                console.error("Erro ao confirmar atividade:", erro);
                mostrarAviso("Não foi possível confirmar a atividade.");
            }
        }
    }

    // MODAL DA AUTORIZAÇÃO
    function abrirAutorizacao(autorizacao) {
        autorizacaoAberta = autorizacao;

        document.getElementById('autorizacao-titulo').textContent = autorizacao.titulo;
        document.getElementById('autorizacao-data').textContent =
            `📅 ${autorizacao.data_evento ? formatarDiaMes(autorizacao.data_evento) : "Data a definir"}`;
        document.getElementById('autorizacao-prazo').textContent =
            `⏰ Responder até ${prazoDaAutorizacao(autorizacao) ? formatarDiaMes(prazoDaAutorizacao(autorizacao)) : "—"}`;
        document.getElementById('autorizacao-local').textContent = `📍 ${autorizacao.local || "Local não informado"}`;
        document.getElementById('autorizacao-aluno').textContent = `👤 ${filho.nome}`;
        document.getElementById('autorizacao-descricao').textContent = autorizacao.descricao || "";

        document.getElementById('modal-autorizacao').showModal();
    }

    async function responderAutorizacao(status) {
        if (!autorizacaoAberta) return;

        try {
            await InicioResponsavelService.responderAutorizacao(autorizacaoAberta.id, filho.id, status);
            document.getElementById('modal-autorizacao').close();
            mostrarAviso(status === 'autorizado' ? "Autorização registrada!" : "Resposta registrada.");
            carregarPainel();
        } catch (erro) {
            console.error("Erro ao responder autorização:", erro);
            mostrarAviso("Não foi possível registrar a resposta.");
        }
    }

    // MODAL DE AVISO / OCORRÊNCIA (MARCA O AVISO COMO LIDO AO ABRIR)
    async function abrirAtualizacao(item) {
        const ehOcorrencia = item.origem === 'ocorrencia';
        const tipo = ehOcorrencia ? 'ocorrência' : item.tipo;

        document.getElementById('atualizacao-titulo').textContent =
            ehOcorrencia ? (NOMES_OCORRENCIA[item.tipo] || "Ocorrência") : item.titulo;

        const badge = document.getElementById('atualizacao-tipo');
        badge.textContent = tipo;
        badge.className = `badge-tipo ${ehOcorrencia ? 'badge-ocorrencia' : `badge-${item.tipo}`}`;

        document.getElementById('atualizacao-meta').textContent =
            `${item.autor || "Coordenação Pedagógica"} · ${formatarDataHora(item.created_at)}`;
        document.getElementById('atualizacao-descricao').textContent = item.descricao;

        document.getElementById('modal-atualizacao').showModal();

        if (!item.lido) {
            try {
                if (ehOcorrencia) {
                    await InicioResponsavelService.marcarOcorrenciaComoLida(item.id, filho.id);
                } else {
                    await AvisosService.marcarComoLido(item.id, [filho.id]);
                }
                carregarPainel();
            } catch (erro) {
                console.error("Erro ao marcar como lido:", erro);
            }
        }
    }

    // ---------------- INICIALIZAÇÃO ----------------

    try {
        const responsavel = await ResponsavelService.buscarPerfilCompleto(idLogado);
        const nome = responsavel?.nome || responsavel?.Nome || "";
        const primeiroNome = nome.split(" ")[0];

        document.getElementById('saudacao-responsavel').textContent =
            primeiroNome ? `${saudacaoPorHora()}, ${primeiroNome}` : saudacaoPorHora();
        document.getElementById('data-inicio').textContent = formatarDataExtensa(new Date());
    } catch (erro) {
        console.error("Erro ao buscar nome para o início:", erro);
    }

    document.querySelectorAll('[data-fechar]').forEach(botao => {
        botao.addEventListener("click", () => document.getElementById(botao.dataset.fechar).close());
    });
    document.getElementById('btn-autorizar').addEventListener("click", () => responderAutorizacao('autorizado'));
    document.getElementById('btn-recusar').addEventListener("click", () => responderAutorizacao('recusado'));

    try {
        ({ filho, filhos } = await obterFilhoSelecionado(idLogado));
    } catch (erro) {
        console.error("Erro ao buscar filhos do responsável:", erro);
    }

    if (!filho) {
        document.getElementById('subtitulo-responsavel').textContent = "Nenhum aluno vinculado a este responsável.";
        document.getElementById('destaque-atencao').hidden = true;
        document.getElementById('lista-atualizacoes').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        document.getElementById('lista-passos').innerHTML = `<p class="painel-vazio">Nenhum aluno vinculado.</p>`;
        return;
    }

    const primeiroNomeFilho = filho.nome.split(" ")[0];
    document.getElementById('subtitulo-responsavel').textContent =
        `Aqui está o que importa hoje na rotina de ${primeiroNomeFilho}.`;

    renderizarSeletorFilho(document.getElementById('seletor-filho'), filho, filhos, "../");
    carregarPainel();
});
