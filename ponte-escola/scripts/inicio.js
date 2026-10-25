document.addEventListener("DOMContentLoaded", async () => {
    
    const idLogado = localStorage.getItem('usuarioLogadoId');
    const turmaId = localStorage.getItem('turmaVisualizadaId');
    
    if (!idLogado) return; 

    // CARREGA O NOME DO USUÁRIO NA SAUDAÇÃO
    try {
        const usuario = await AdministradorService.buscarPerfilCompleto(idLogado);
        const primeiroNome = usuario.nome.split(" ")[0];

        const elementoSaudacao = document.getElementById('saudacao-inicio');
        if (elementoSaudacao) {
            elementoSaudacao.textContent = `Olá, ${primeiroNome}! 👋`;
        }
    } catch (erro) {
        console.error("Erro ao buscar nome para o início:", erro);
    }

    // CARREGA AS ESTATÍSTICAS E ÚLTIMOS AVISOS DA TURMA
    if (!turmaId) return;

    try {
        const qtdAvisos = await InicioService.contarAvisos(turmaId);
        const elAvisos = document.getElementById('stat-avisos');
        if (elAvisos) elAvisos.textContent = qtdAvisos;

        const qtdPendencias = await InicioService.contarPendencias(turmaId);
        const elPendencias = document.getElementById('stat-pendencias');
        if (elPendencias) elPendencias.textContent = qtdPendencias;

        const ultimosAvisos = await InicioService.listarUltimosAvisos(turmaId);
        const containerAvisos = document.getElementById('lista-avisos-home');

        if (containerAvisos) {
            if (ultimosAvisos.length === 0) {
                containerAvisos.innerHTML = "<p>Nenhum aviso recente.</p>";
            } else {
                containerAvisos.innerHTML = ultimosAvisos.map(aviso => `
                    <div class="previa-aviso" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                        <div>
                            <span style="font-size: 0.75rem; font-weight: bold; color: var(--color-primary); text-transform: capitalize;">${aviso.tipo}</span>
                            <p style="margin: 0.25rem 0; font-weight: 600; color: #333;">${aviso.titulo}</p>
                            <span style="font-size: 0.75rem; color: #888;">${new Date(aviso.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                `).join("");
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar estatísticas de avisos:", erro);
    }
});