(function () {
    const listaContainer = document.getElementById("autorizacoes-lista");
    const detalheContainer = document.getElementById("autorizacao-detalhe");

    // FORMATAR DATA
    const formatarData = (dataString) => {
        if(!dataString) return "Data a definir";
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // CARREGA A LISTA DA ESQUERDA
    async function carregarLista() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Turma";

        // ATUALIZA O SUBTÍTULO COM O NOME DA TURMA
        const subtitulo = document.getElementById("subtitulo-autorizacoes-turma");
        if (subtitulo) {
            subtitulo.textContent = `Gerencie as autorizações de passeios e eventos · ${turmaNome}`;
        }

        if (!turmaId) return;

        try {
            const autorizacoes = await AutorizacoesService.listarPorTurma(turmaId);

            if (autorizacoes.length === 0) {
                listaContainer.innerHTML = "<p>Nenhuma autorização encontrada.</p>";
                return;
            }

            listaContainer.innerHTML = autorizacoes.map(aut => {
                
                let ok = 0, no = 0, pendente = 0;
                aut.autorizacoes_respostas.forEach(r => {
                    if (r.status === 'autorizado') ok++;
                    else if (r.status === 'recusado') no++;
                    else pendente++;
                });

                const classeStatus = aut.status === 'aberto' ? 'aberto' : 'encerrado';

                return `
                    <div class="card-passeio" onclick="selecionarAutorizacao(${aut.id}, this)">
                        <div class="card-passeio-topo">
                            <h3 class="card-passeio-titulo">${aut.titulo}</h3>
                            <span class="status-passeio ${classeStatus}">${aut.status.charAt(0).toUpperCase() + aut.status.slice(1)}</span>
                        </div>
                        <p class="card-passeio-data">📅 ${formatarData(aut.data_evento)}</p>
                        <div class="card-passeio-stats">
                            <span class="stat-ok">${ok} ✓</span>
                            <span class="stat-no">${no} ✕</span>
                            <span class="stat-pendente">${pendente} pendente</span>
                        </div>
                    </div>
                `;
            }).join("");

            if (autorizacoes.length > 0) {
                const primeiroCard = document.querySelector('.card-passeio');
                selecionarAutorizacao(autorizacoes[0].id, primeiroCard);
            }

        } catch (erro) {
            console.error("Erro ao carregar lista:", erro);
            listaContainer.innerHTML = "<p>Erro ao carregar.</p>";
        }
    }

    // CARREGA OS DETALHES DA DIREITA QUANDO CLICA
    window.selecionarAutorizacao = async function(id, elemento = null) {
        document.querySelectorAll('.card-passeio').forEach(c => c.classList.remove('ativo'));
        if (elemento) elemento.classList.add('ativo');

        try {
            const { autorizacao, alunos } = await AutorizacoesService.detalharAutorizacao(id);

            let ok = 0, no = 0, pendente = 0;
            alunos.forEach(aluno => {
                const resp = aluno.autorizacoes_respostas[0]; 
                if (resp?.status === 'autorizado') ok++;
                else if (resp?.status === 'recusado') no++;
                else pendente++;
            });

            const total = ok + no + pendente;
            const porcentagem = total > 0 ? Math.round((ok / total) * 100) : 0;
            const porcentagemRecusado = total > 0 ? Math.round((no / total) * 100) : 0;

            detalheContainer.innerHTML = `
                <div class="detalhe-cabecalho">
                    <h3 class="detalhe-titulo">${autorizacao.titulo}</h3>
                    <div class="detalhe-meta">
                        <span>📅 ${formatarData(autorizacao.data_evento)}</span>
                        <span>👥 ${total} alunos</span>
                        <span>📍 ${autorizacao.local || 'Local não informado'}</span>
                    </div>
                </div>

                <p class="detalhe-descricao">${autorizacao.descricao}</p>

                <div class="detalhe-stats">
                    <div class="stat-card verde">
                        <strong>${ok}</strong>
                        <span>Autorizados</span>
                    </div>
                    <div class="stat-card vermelho">
                        <strong>${no}</strong>
                        <span>Recusados</span>
                    </div>
                    <div class="stat-card laranja">
                        <strong>${pendente}</strong>
                        <span>Pendentes</span>
                    </div>
                </div>

                <div class="barra-progresso">
                    <div class="verde" style="width: ${porcentagem}%"></div>
                    <div class="vermelho" style="width: ${porcentagemRecusado}%"></div>
                </div>
                <p class="progresso-legenda">${porcentagem}% autorizado</p>

                <h4 class="detalhe-pais-titulo">Resposta dos pais</h4>
                <div class="lista-pais">
                    ${alunos.map(aluno => {
                        const resp = aluno.autorizacoes_respostas[0]?.status || 'pendente';
                        const classeStatus = resp === 'autorizado' ? 'autorizado' : (resp === 'recusado' ? 'recusado' : 'pendente');
                        return `
                            <div class="linha-pai">
                                <span class="linha-pai-nome">${aluno.nome || aluno.Name}</span>
                                <span class="status-pai ${classeStatus}">${resp.charAt(0).toUpperCase() + resp.slice(1)}</span>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;

        } catch (erro) {
            console.error("Erro ao carregar detalhes:", erro);
            detalheContainer.innerHTML = "<p>Erro ao carregar detalhes.</p>";
        }
    }

    carregarLista();
})();