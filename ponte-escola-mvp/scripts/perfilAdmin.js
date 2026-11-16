document.addEventListener("DOMContentLoaded", async () => {
    const idLogado = localStorage.getItem('usuarioLogadoId');
    if (!idLogado) {
        window.location.href = "../index.html";
        return;
    }

    const inputNome = document.getElementById("perfil-nome-exibicao");
    const inputEmail = document.getElementById("perfil-email");
    const inputTelefone = document.getElementById("perfil-telefone");
    const btnSalvar = document.getElementById("btn-salvar-perfil");
    const btnCancelar = document.getElementById("btn-cancelar");
    const nomeVisual = document.getElementById("perfil-nome-visual");
    const tipoVisual = document.getElementById("perfil-tipo-visual");
    const avatar = document.getElementById("perfil-avatar-iniciais");

    let dadosOriginais = {};

    // CARREGA OS DADOS DO BANCO
    async function carregarPerfil() {
        try {
            const usuario = await AdministradorService.buscarPerfilCompleto(idLogado);
            
            dadosOriginais = {
                nome: usuario.nome || "",
                email: usuario.email || "",
                telefone: usuario.telefone || ""
            };

            inputNome.value = dadosOriginais.nome;
            inputEmail.value = dadosOriginais.email;
            inputTelefone.value = dadosOriginais.telefone;

            nomeVisual.textContent = dadosOriginais.nome;
            tipoVisual.textContent = usuario.tipo === 'admin' ? 'Administrador' : 'Professor';

            const iniciais = dadosOriginais.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            avatar.innerHTML = `<span>${iniciais || "AD"}</span>`;

        } catch (erro) {
            console.error("Erro ao carregar perfil:", erro);
        }
    }

    // SALVAR ALTERAÇÕES
    btnSalvar?.addEventListener("click", async () => {
        const novoNome = inputNome.value.trim();
        const novoEmail = inputEmail.value.trim();
        const novoTelefone = inputTelefone.value.trim();

        if (!novoNome || !novoEmail) {
            alert("Nome e E-mail são obrigatórios.");
            return;
        }

        btnSalvar.textContent = "Salvando...";
        btnSalvar.disabled = true;

        try {
            await AdministradorService.atualizarPerfil(idLogado, novoNome, novoEmail, novoTelefone);
            
            dadosOriginais = { nome: novoNome, email: novoEmail, telefone: novoTelefone };
            nomeVisual.textContent = novoNome;
            
            const iniciais = novoNome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            avatar.innerHTML = `<span>${iniciais}</span>`;
            
            alert("Perfil atualizado com sucesso!");

        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro ao salvar as alterações.");
        } finally {
            btnSalvar.textContent = "Salvar alterações";
            btnSalvar.disabled = false;
        }
    });

    // CANCELAR (Volta os valores originais)
    btnCancelar?.addEventListener("click", () => {
        inputNome.value = dadosOriginais.nome;
        inputEmail.value = dadosOriginais.email;
        inputTelefone.value = dadosOriginais.telefone;
    });

    carregarPerfil();
});