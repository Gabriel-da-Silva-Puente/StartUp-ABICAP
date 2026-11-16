(function () {
    const feedPosts = document.getElementById("feed-posts");
    const btnPrincipal = document.getElementById("btn-principal");
    const modalPublicar = document.getElementById("modal-publicar");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
    const formPublicar = document.getElementById("form-publicar");
    const subtitulo = document.getElementById("subtitulo-mural-da-turma");
    
    const inputFoto = document.getElementById("input-foto");
    const labelFoto = document.getElementById("label-foto");
    let arquivoSelecionado = null;

    const turmaNome = localStorage.getItem('turmaVisualizadaNome') || "Sua Turma";
    const autorIdLogado = localStorage.getItem('usuarioLogadoId');

    if (subtitulo) subtitulo.textContent = `${turmaNome} · Compartilhe momentos com os pais`;

    const formatarData = (dataString) => {
        return new Date(dataString).toLocaleDateString('pt-BR');
    };

    const getPostsCurtidos = () => JSON.parse(localStorage.getItem('postsCurtidos') || '[]');
    const jaCurtiu = (postId) => getPostsCurtidos().includes(postId);

    async function carregarPosts() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) return;

        try {
            const posts = await MuralService.listarPosts(turmaId);

            if (posts.length === 0) {
                feedPosts.innerHTML = "<p>Nenhuma publicação ainda.</p>";
                return;
            }

            feedPosts.innerHTML = posts.map(post => {
                const dataPost = formatarData(post.created_at);
                const iniciaisAutor = post.administrador?.nome ? post.administrador.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "AC";
                const nomeAutor = post.administrador?.nome || "Professor";
                const curtido = jaCurtiu(post.id);
                const iconeCoracao = curtido ? '❤️' : '♡';

                // VERIFICA SE É O DONO DO POST
                const ehDonoDoPost = String(post.autor_id) === String(autorIdLogado);

                // MENU DE OPÇÕES DO POST
                const menuPost = ehDonoDoPost 
                    ? `<div class="menu-container">
                        <button class="btn-opcoes" onclick="toggleMenu(this)">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                        </button>
                        <div class="menu-dropdown">
                            <button data-legenda="${encodeURIComponent(post.legenda)}"
                                onclick="editarLegendaPost(${post.id}, decodeURIComponent(this.dataset.legenda))">
                                    ✏️ Editar
                            </button>
                            <button class="excluir" onclick="excluirPostMural(${post.id})">
                                🗑️ Excluir Post
                            </button>
                        </div>
                       </div>` 
                    : "";

                return `
                    <div class="card-post">
                        <img src="${post.imagem_url}" alt="Foto da turma">
                        <div class="card-post-corpo">
                            <div class="card-post-autor">
                                <div class="card-post-avatar">${iniciaisAutor}</div>
                                <div>
                                    <p class="card-post-nome">${nomeAutor}</p>
                                </div>
                                ${menuPost}
                            </div>
                            <p class="card-post-legenda">${post.legenda}</p>
                            
                            <!-- DATA DISCRETA -->
                            <span class="card-post-data-post">Publicado em ${dataPost}</span>

                            <div class="card-post-acoes">
                                <button onclick="alternarCurtida(${post.id}, ${post.curtidas})" class="btn-acao-post ${curtido ? 'curtido' : ''}">
                                    ${iconeCoracao} ${post.curtidas}
                                </button>
                                <button onclick="toggleComentarios(${post.id})" class="btn-acao-post">
                                    💬 Comentários (${post.mural_comentarios.length})
                                </button>
                            </div>

                            <div class="comentarios-box" id="comentarios-${post.id}" style="display: none;">
                                <div class="lista-comentarios">
                                    ${post.mural_comentarios.length === 0 ? '<p style="font-size:0.8125rem; color:#888; text-align:center;">Nenhum comentário ainda.</p>' : ''}
                                    ${post.mural_comentarios.map(c => `
                                        <div class="comentario" style="display: flex; justify-content: space-between; align-items: flex-start;">
                                            <div>
                                                <strong>${c.autor_nome}:</strong> ${c.texto}
                                            </div>
                                            <button class="btn-excluir-comentario" onclick="excluirComentarioMural(${c.id})" title="Excluir">✕</button>
                                        </div>
                                    `).join("")}
                                </div>
                                <div class="input-comentario">
                                    <input type="text" id="input-comentario-${post.id}" placeholder="Escreva um comentário..." onkeypress="if(event.key === 'Enter') enviarComentario(${post.id})">
                                    <button onclick="enviarComentario(${post.id})">Enviar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

        } catch (erro) {
            console.error("Erro ao carregar mural:", erro);
            feedPosts.innerHTML = "<p>Erro ao carregar o mural.</p>";
        }
    }

    // --- FUNÇÕES GLOBAIS ---
    window.alternarCurtida = async function (id, curtidasAtuais) {
        let curtidos = getPostsCurtidos();
        const jaCurtido = curtidos.includes(id);

        try {
            if (jaCurtido) {
                await MuralService.descurtirPost(id, curtidasAtuais);
                curtidos = curtidos.filter(postId => postId !== id);
            } else {
                await MuralService.curtirPost(id, curtidasAtuais);
                curtidos.push(id);
            }
            localStorage.setItem('postsCurtidos', JSON.stringify(curtidos));
            carregarPosts(); 
        } catch (e) { console.error(e); }
    };

    window.toggleComentarios = function (id) {
        const box = document.getElementById(`comentarios-${id}`);
        const estaAberto = box.style.display === "block";
        document.querySelectorAll('.comentarios-box').forEach(b => b.style.display = "none");
        if (!estaAberto) {
            box.style.display = "block";
            document.getElementById(`input-comentario-${id}`)?.focus();
        }
    };

    window.enviarComentario = async function (id) {
        const input = document.getElementById(`input-comentario-${id}`);
        const texto = input.value.trim();
        if (!texto) return;
        const nomeAutor = localStorage.getItem('usuarioLogadoNome') || "Professor";
        
        try {
            await MuralService.comentar(id, nomeAutor, texto);
            carregarPosts(); 
        } catch (e) { console.error(e); }
    };

    // --- LÓGICA DO MENU DE OPÇÕES ---
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

    // --- CRUD: EDITAR POST ---
    window.editarLegendaPost = async function(id, legendaAtual) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        
        const novaLegenda = prompt("Edite a legenda do post:", legendaAtual);
        if (novaLegenda === null || novaLegenda.trim() === "" || novaLegenda === legendaAtual) return;

        try {
            await MuralService.editarPost(id, novaLegenda);
            carregarPosts();
        } catch (e) {
            console.error(e);
            alert("Erro ao editar legenda.");
        }
    };

    // --- CRUD: EXCLUIR POST ---
    window.excluirPostMural = async function(id) {
        document.querySelectorAll('.menu-dropdown').forEach(m => m.classList.remove('aberto'));
        if (!confirm("Excluir esta publicação? Os comentários também serão apagados.")) return;

        try {
            await MuralService.excluirPost(id);
            carregarPosts();
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir post.");
        }
    };

    // --- CRUD: EXCLUIR COMENTÁRIO ---
    window.excluirComentarioMural = async function(id) {
        if (!confirm("Excluir este comentário?")) return;
        try {
            await MuralService.excluirComentario(id);
            carregarPosts();
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir comentário.");
        }
    };

    // --- LÓGICA DO MODAL DE PUBLICAR ---
    btnPrincipal?.addEventListener("click", () => modalPublicar.showModal());
    btnFecharModal?.addEventListener("click", () => modalPublicar.close());

    inputFoto?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            arquivoSelecionado = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                labelFoto.classList.add("tem-foto");
                labelFoto.innerHTML = `
                    <img src="${event.target.result}" class="preview-imagem" alt="Preview">
                    <span class="btn-trocar-foto">Trocar foto</span>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    formPublicar?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        const autorId = localStorage.getItem('usuarioLogadoId');
        const legenda = document.getElementById("input-legenda").value;
        const btnSalvar = document.getElementById("btn-salvar-post");

        if (!arquivoSelecionado) {
            alert("Por favor, selecione uma foto primeiro!");
            return;
        }

        btnSalvar.textContent = "Publicando...";
        btnSalvar.disabled = true;

        try {
            await MuralService.criarPost(turmaId, autorId, "Professor", legenda, arquivoSelecionado);
            
            modalPublicar.close();
            formPublicar.reset();
            
            arquivoSelecionado = null;
            labelFoto.classList.remove("tem-foto");
            labelFoto.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span id="texto-foto">Clique para selecionar uma imagem</span>
                <input type="file" id="input-foto" accept="image/*" hidden>
            `;
            
            document.getElementById("input-foto").addEventListener("change", (ev) => {
                const file = ev.target.files[0];
                if (file) {
                    arquivoSelecionado = file;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        labelFoto.classList.add("tem-foto");
                        labelFoto.innerHTML = `
                            <img src="${event.target.result}" class="preview-imagem" alt="Preview">
                            <span class="btn-trocar-foto">Trocar foto</span>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });

            carregarPosts(); 
            
        } catch (erro) {
            console.error("Erro ao publicar:", erro);
            alert("Erro ao publicar. Tente novamente.");
        } finally {
            btnSalvar.textContent = "Publicar";
            btnSalvar.disabled = false;
        }
    });

    carregarPosts();
})();