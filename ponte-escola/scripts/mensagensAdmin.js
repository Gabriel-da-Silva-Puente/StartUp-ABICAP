(function () {
    const listaContainer = document.getElementById("mensagens-lista");
    const detalheContainer = document.getElementById("mensagem-detalhe");
    const subtitulo = document.getElementById("subtitulo-mensagens");
    const modal = document.getElementById("modal-mensagem");
    const form = document.getElementById("form-mensagem");
    const btnNova = document.getElementById("btn-nova-mensagem");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnFechar = document.getElementById("btn-fechar-modal");

    const selectTurma = document.getElementById("modal-turma");
    const selectAluno = document.getElementById("modal-aluno");

    let filtroAtual = 'todas';

    async function carregarTurmasModal() {
        try {
            const turmas = await MensagensService.listarTurmas();
            selectTurma.innerHTML = '<option value="">Selecione a turma...</option>';
            turmas.forEach(t => {
                selectTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
            });
        } catch (e) { console.error("Erro ao carregar turmas:", e); }
    }

    selectTurma.addEventListener("change", async (e) => {
        const turmaId = e.target.value;
        selectAluno.innerHTML = '<option value="">Carregando...</option>';
        selectAluno.disabled = true;

        if (!turmaId) {
            selectAluno.innerHTML = '<option value="">Selecione a turma primeiro...</option>';
            return;
        }

        try {
            const alunos = await MensagensService.listarAlunosPorTurma(turmaId);
            selectAluno.innerHTML = '<option value="">Selecione o aluno...</option>';
            alunos.forEach(a => {
                selectAluno.innerHTML += `<option value="${a.responsavel_id}">${a.nome}</option>`;
            });
            selectAluno.disabled = false;
        } catch (err) {
            console.error("Erro ao carregar alunos:", err);
            selectAluno.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    });

    async function carregarLista() {
        try {
            const conversas = await MensagensService.listarTodas();
            
            if (subtitulo) {
                subtitulo.textContent = `${conversas.length} mensagens`;
            }

            let filtradas = conversas;
            if (filtroAtual === 'respondidas') {
                filtradas = conversas.filter(c => c.status === 'resolvido');
            } else if (filtroAtual === 'nao-respondidas') {
                filtradas = conversas.filter(c => c.status !== 'resolvido');
            }

            if (filtradas.length === 0) {
                listaContainer.innerHTML = "<p style='padding: 1rem; color: #888;'>Nenhuma mensagem encontrada.</p>";
                return;
            }

            listaContainer.innerHTML = filtradas.map(conv => {
                const data = new Date(conv.created_at).toLocaleDateString('pt-BR');
                const naoLida = !conv.lida_pelo_admin;

                return `
                    <div class="card-conversa ${naoLida ? 'nao-lida' : ''}" onclick="selecionarConversa(${conv.id})" id="card-conv-${conv.id}">
                        <div class="card-conversa-topo">
                            <span class="card-conversa-nome">
                                ${naoLida ? '<span class="card-conversa-bolinha"></span>' : ''}
                                ${conv.remetente_nome}
                            </span>
                            <span class="card-conversa-data">${data}</span>
                        </div>
                        <p class="card-conversa-assunto">${conv.assunto}</p>
                        <p class="card-conversa-previa">${conv.previa}</p>
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar lista:", erro);
        }
    }

    window.selecionarConversa = async function(id) {
        document.querySelectorAll('.card-conversa').forEach(c => c.classList.remove('ativo'));
        document.getElementById(`card-conv-${id}`)?.classList.add('ativo');

        try {
            const { conversa, mensagens } = await MensagensService.abrirConversa(id);

            const { data: responsaveis } = await banco.from('responsavel').select('*');
            const remetente = responsaveis?.find(r => r.id === conversa.responsavel_id);
            const nomeRemetente = remetente ? (remetente.Nome || remetente.nome || "Responsável") : "Responsável";

            carregarLista(); 

            const msgOriginal = mensagens[0];
            const respostas = mensagens.slice(1);

            detalheContainer.innerHTML = `
                <div class="email-container">
                    
                    <!-- Cabeçalho -->
                    <div class="email-header">
                        <div class="email-header-topo">
                            <h2 class="email-assunto">${conversa.assunto}</h2>
                            <div class="email-acoes">
                                ${conversa.status !== 'resolvido' 
                                    ? `<button class="btn-email-acao" onclick="resolverConversa(${conversa.id})" title="Arquivar">Arquivar</button>` 
                                    : `<span class="email-status">✓ Arquivado</span>`}
                            </div>
                        </div>
                        
                        <div class="email-remetente">
                            <div class="email-avatar">${nomeRemetente.substring(0, 1).toUpperCase()}</div>
                            <div class="email-remetente-info">
                                <div class="email-linha-principal">
                                    <strong>${nomeRemetente}</strong>
                                </div>
                                <div class="email-destinatario">
                                    ${new Date(conversa.created_at).toLocaleString('pt-BR')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Corpo Original -->
                    <div class="email-corpo-texto">
                        ${msgOriginal ? msgOriginal.texto.replace(/\n/g, '<br>') : ''}
                    </div>

                    <!-- Respostas -->
                    ${respostas.length > 0 ? `
                        <div class="email-thread">
                            ${respostas.map(msg => `
                                <div class="email-resposta-bloco">
                                    <div class="email-resposta-meta">
                                        <strong>${msg.remetente === 'admin' ? 'Administração' : nomeRemetente}</strong>
                                        <span>${new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div class="email-resposta-texto">
                                        ${msg.texto.replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    ` : ''}

                    <!-- Rodapé de Resposta -->
                    ${conversa.status !== 'resolvido' ? `
                    <div class="email-rodape">
                        <div class="email-rodape-caixa">
                            <div class="email-rodape-opcoes">
                                Responder a ${nomeRemetente}...
                            </div>
                            <textarea id="input-resposta" placeholder="Escreva sua resposta..."></textarea>
                            <div class="email-rodape-botoes">
                                <button class="btn-enviar-email" onclick="enviarResposta(${conversa.id})">Enviar</button>
                            </div>
                        </div>
                    </div>` : ''}

                </div>
            `;

        } catch (erro) {
            console.error("Erro ao abrir conversa:", erro);
        }
    }

    window.enviarResposta = async function(id) {
        const input = document.getElementById("input-resposta");
        const texto = input.value.trim();
        if (!texto) return;

        try {
            await MensagensService.responder(id, texto);
            selecionarConversa(id); 
        } catch (erro) { console.error("Erro ao responder:", erro); }
    }

    window.resolverConversa = async function(id) {
        if (!confirm("Arquivar esta conversa? Ela irá para 'Respondidas'.")) return;
        try {
            await MensagensService.resolver(id);
            selecionarConversa(id);
            carregarLista();
        } catch (erro) { console.error("Erro ao arquivar:", erro); }
    }

    document.querySelectorAll(".filtros-mensagens button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filtros-mensagens button").forEach(b => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            filtroAtual = btn.dataset.filtro;
            carregarLista();
        });
    });

    btnNova?.addEventListener("click", () => {
        form.reset();
        selectAluno.disabled = true;
        selectAluno.innerHTML = '<option value="">Selecione a turma primeiro...</option>';
        carregarTurmasModal();
        modal.showModal();
    });

    btnFechar?.addEventListener("click", () => modal.close());
    btnCancelar?.addEventListener("click", () => modal.close());

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const assunto = document.getElementById("assunto").value;
        const responsavelId = selectAluno.value;
        const texto = document.getElementById("mensagem").value;

        if (!responsavelId) { alert("Por favor, selecione o aluno/responsável."); return; }

        try {
            await MensagensService.criar(assunto, responsavelId, texto);
            modal.close();
            carregarLista();
        } catch (erro) {
            console.error("Erro ao criar mensagem:", erro);
            alert("Erro ao enviar mensagem.");
        }
    });

    carregarLista();
})();