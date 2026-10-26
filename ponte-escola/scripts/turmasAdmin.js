(function () {
    const listaContainer = document.getElementById("lista-turmas");
    const modal = document.getElementById("modal-turma");
    const form = document.getElementById("form-turma");
    const inputNome = document.getElementById("turma-nome");
    const inputAno = document.getElementById("turma-ano");
    const inputTurno = document.getElementById("turma-turno");
    const inputInfantil = document.getElementById("turma-infantil");
    
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const btnCancelar = document.getElementById("btn-cancelar-turma");
    const btnNovaTurma = document.getElementById("btn-nova-turma");

    let idTurmaEditando = null;

    async function carregarTurmas() {
        try {
            const turmas = await TurmasService.listarTodas();
            
            if (turmas.length === 0) {
                listaContainer.innerHTML = "<p>Nenhuma turma cadastrada.</p>";
                return;
            }

            listaContainer.innerHTML = turmas.map(turma => {
                const iniciais = turma.nome.substring(0, 3).toUpperCase();
                
                let detalhes = [];
                if (turma.ano_letivo) detalhes.push(`Ano: ${turma.ano_letivo}`);
                if (turma.turno) detalhes.push(`Turno: ${turma.turno}`);
                const textoDetalhes = detalhes.length > 0 ? detalhes.join(' · ') : 'Sem informações adicionais';

                // MUDANÇA AQUI: Usando "Prof(s)."
                const textoProfessores = turma.professor_nome !== "Sem professor" 
                    ? `Prof(s). ${turma.professor_nome}` 
                    : "Sem professor";

                return `
                    <div class="card-turma">
                        <div class="card-turma-avatar">${iniciais}</div>
                        <div class="card-turma-info" onclick="acessarTurma(${turma.id}, '${turma.nome}', '${turma.professor_nome}', ${turma.total_alunos})" style="cursor: pointer;">
                            <p class="card-turma-nome">${turma.nome}</p>
                            <p class="card-turma-professor">${textoProfessores}</p>
                            <p style="font-size: 0.75rem; color: #888; margin-top: 0.25rem;">
                                ${textoDetalhes} ${turma.eh_jardim_infancia ? '· 🌱 Infantil' : ''}
                            </p>
                        </div>
                        <div class="card-turma-stats">
                            <div class="card-turma-stat">
                                <strong>${turma.total_alunos}</strong>
                                <span>alunos</span>
                            </div>
                        </div>
                        
                        <div class="menu-container">
                            <button class="btn-opcoes" onclick="event.stopPropagation(); toggleMenu(this)">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                            </button>
                            <div class="menu-dropdown">
                                <button onclick="event.stopPropagation(); prepararEdicao(${turma.id}, '${turma.nome}', '${turma.ano_letivo || ''}', '${turma.turno || ''}', ${turma.eh_jardim_infancia})">
                                    ✏️ Editar
                                </button>
                                <button class="excluir" onclick="event.stopPropagation(); excluirTurma(${turma.id})">
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar turmas:", erro);
            listaContainer.innerHTML = "<p>Erro ao carregar as turmas.</p>";
        }
    }

    window.acessarTurma = function (id, nome, professor, totalAlunos) {
        localStorage.setItem('adminTurmaId', id);
        localStorage.setItem('adminTurmaNome', nome);
        localStorage.setItem('adminTurmaProfessor', professor);
        localStorage.setItem('adminTurmaTotal', totalAlunos);
        window.location.href = "administrador-turma-alunos.html";
    }

    window.toggleMenu = function(botao) {
        const menu = botao.nextElementSibling;
        document.querySelectorAll('.menu-dropdown').forEach(m => {
            if (m !== menu) m.classList.remove('aberto');
        });
        menu.classList.toggle('aberto');
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-container')) {
            document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        }
    });

    btnNovaTurma?.addEventListener("click", () => {
        idTurmaEditando = null;
        form.reset();
        document.getElementById("modal-turma-titulo").textContent = "Nova Turma";
        modal.showModal();
    });

    btnFecharModal?.addEventListener("click", () => modal.close());
    btnCancelar?.addEventListener("click", () => modal.close());

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = inputNome.value.trim();
        const ano = inputAno.value.trim();
        const turno = inputTurno.value;
        const infantil = inputInfantil.checked;

        if (!nome) return;

        try {
            if (idTurmaEditando) {
                await TurmasService.atualizar(idTurmaEditando, nome, ano, turno, infantil);
            } else {
                await TurmasService.criar(nome, ano, turno, infantil);
            }
            modal.close();
            form.reset();
            carregarTurmas();
        } catch (erro) {
            console.error("Erro ao salvar turma:", erro);
            alert("Erro ao salvar a turma.");
        }
    });

    window.prepararEdicao = function(id, nome, ano, turno, infantil) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        idTurmaEditando = id;
        inputNome.value = nome;
        inputAno.value = ano;
        inputTurno.value = turno;
        inputInfantil.checked = infantil;
        
        document.getElementById("modal-turma-titulo").textContent = "Editar Turma";
        modal.showModal();
    }

    window.excluirTurma = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        
        if (!confirm("Tem certeza que deseja excluir esta turma? Todos os alunos e avisos vinculados podem ser afetados.")) return;
        
        try {
            await TurmasService.excluir(id);
            carregarTurmas();
        } catch (erro) {
            console.error("Erro ao excluir turma:", erro);
            alert("Erro ao excluir a turma. Verifique se não há alunos vinculados.");
        }
    }

    carregarTurmas();
})();