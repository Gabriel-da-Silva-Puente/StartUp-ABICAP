(function () {
    const container = document.getElementById("lista-alunos-turma");
    const turmaId = localStorage.getItem('adminTurmaId');
    const turmaNome = localStorage.getItem('adminTurmaNome');
    const professor = localStorage.getItem('adminTurmaProfessor');
    const totalAlunos = localStorage.getItem('adminTurmaTotal');

    if (!turmaId) {
        window.location.href = "administrador-turmas.html";
        return;
    }

    document.getElementById("titulo-turma").textContent = turmaNome;
    document.getElementById("subtitulo-turma").textContent = `Prof. ${professor} · ${totalAlunos} alunos`;

    async function carregarAlunos() {
        try {
            const alunos = await TurmasService.listarAlunos(turmaId);
            
            if (alunos.length === 0) {
                container.innerHTML = "<p>Nenhum aluno cadastrado nesta turma.</p>";
                return;
            }

            container.innerHTML = alunos.map(aluno => {
                return `
                    <div class="linha-aluno">
                        <div class="aluno-info">
                            <span class="aluno-nome">${aluno.nome}</span>
                            <span class="aluno-turma">Idade: ${aluno.idade ? aluno.idade + ' anos' : 'Não informada'}</span>
                        </div>
                        <span class="btn-ver-perfil" onclick="alert('Abrir perfil do aluno ${aluno.nome}')">Ver Perfil →</span>
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao listar alunos:", erro);
            container.innerHTML = "<p>Erro ao carregar os alunos.</p>";
        }
    }

    carregarAlunos();
})();