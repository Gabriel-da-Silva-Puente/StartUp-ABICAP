document.addEventListener("DOMContentLoaded", async () => {
    const idLogado = localStorage.getItem('usuarioLogadoId');
    
    if (idLogado) {
        try {
            const usuario = await AdministradorService.buscarPerfilCompleto(idLogado);
            document.getElementById('saudacao-admin').textContent = `Olá, ${usuario.nome.split(" ")[0]}! 👋`;
        } catch (e) { console.error(e); }
    }

    try {
        const stats = await InicioAdminService.buscarEstatisticas();
        
        document.getElementById('stat-alunos').textContent = stats.alunos || 0;
        document.getElementById('stat-avisos').textContent = stats.avisos || 0;
        document.getElementById('stat-turmas').textContent = stats.turmas || 0;
        document.getElementById('stat-ocorrencias').textContent = stats.abertas || 0;

        const elPendencia = document.getElementById('pendencia-ocorrencias');
        if (elPendencia) {
            elPendencia.textContent = `${stats.abertas} ocorrências abertas`;
        }

    } catch (e) { console.error("Erro nas estatísticas:", e); }

    try {
        const recentes = await InicioAdminService.buscarOcorrenciasRecentes();
        const container = document.getElementById('lista-ocorrencias-resumo');

        if (recentes.length === 0) {
            container.innerHTML = "<p style='font-size:0.875rem; color:#888;'>Nenhuma ocorrência registrada.</p>";
            return;
        }

        container.innerHTML = recentes.map(oc => {
            let classeTipo = 'comportamental'; 
            if (oc.tipo === 'saude') classeTipo = 'saude';
            if (oc.tipo === 'acidente') classeTipo = 'acidente';
            if (oc.tipo === 'alimentacao') classeTipo = 'alimentacao';

            const dataFormatada = new Date(oc.created_at).toLocaleDateString('pt-BR');

            return `
                <div class="linha-ocorrencia">
                    <span class="linha-ocorrencia-tipo ${classeTipo}"></span>
                    <div class="linha-ocorrencia-info">
                        <p class="linha-ocorrencia-nome">${oc.aluno?.nome || 'Aluno'}</p>
                        <p class="linha-ocorrencia-desc">${oc.descricao}</p>
                    </div>
                    <span class="linha-ocorrencia-data">${dataFormatada}</span>
                </div>
            `;
        }).join("");

    } catch (e) { console.error("Erro nas recentes:", e); }
});