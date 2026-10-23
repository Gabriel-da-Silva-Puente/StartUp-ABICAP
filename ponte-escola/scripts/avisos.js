(function () {
    const modal = document.getElementById("modal-aviso");
    const btnNovo = document.getElementById("btn-novo-aviso");
    const btnCancelar = document.getElementById("btn-cancelar-aviso");
    const form = document.getElementById("form-aviso");
    const btnFechar = document.getElementById("btn-fechar-modal");
    const selectTurma = document.getElementById("aviso-turma"); 
    
    const botoesCategoria = document.querySelectorAll(".btn-categoria");
    const inputTipo = document.getElementById("aviso-tipo");

    // FUNÇÃO PARA CARREGAR AS TURMAS NO SELECT 
    async function carregarTurmasSelect() {
        const autorId = localStorage.getItem('usuarioLogadoId');
        if (!autorId || !selectTurma) return;

        try {
            const turmas = await AvisosService.buscarTurmasDoProfessor(autorId);
            
            
            selectTurma.innerHTML = '';

            if (turmas.length === 0) {
                selectTurma.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
                return;
            }

            
            turmas.forEach(item => {
                const option = document.createElement("option");
                option.value = item.turma.id; 
                option.textContent = item.turma.nome; 
                selectTurma.appendChild(option);
            });

        } catch (erro) {
            console.error("Erro ao carregar turmas:", erro);
            selectTurma.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    carregarTurmasSelect();

    // LÓGICA DO MODAL
    btnNovo?.addEventListener("click", () => {
        form.reset(); 
        
        carregarTurmasSelect(); 

        botoesCategoria.forEach(b => b.classList.remove("ativo"));
        

        document.querySelector('.btn-categoria[data-valor="comunicado"]').classList.add("ativo");
        inputTipo.value = "comunicado"; 
        
        modal.showModal();
    });

    btnCancelar?.addEventListener("click", () => modal.close());
    btnFechar?.addEventListener("click", () => modal.close());

    botoesCategoria.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesCategoria.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            inputTipo.value = botao.dataset.valor;
        });
    });

    // LÓGICA DE SALVAR NO BANCO 
    form?.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const titulo = document.getElementById("aviso-titulo").value;
        const descricao = document.getElementById("aviso-mensagem").value;
        const tipo = inputTipo.value; 
        const turmaId = document.getElementById("aviso-turma").value; 
        const autorId = localStorage.getItem('usuarioLogadoId'); 
        const dataEvento = document.getElementById("aviso-data").value; 

        if (!turmaId) {
            alert("Por favor, selecione uma turma.");
            return;
        }

        try {
            await AvisosService.criar(titulo, descricao, tipo, turmaId, autorId, dataEvento);
            
            alert("Aviso publicado com sucesso!");
            modal.close();
            form.reset();
            
        } catch (erro) {
            console.error("Erro ao publicar:", erro);
            alert("Erro ao publicar o aviso. Verifique o console.");
        }
    });
})();