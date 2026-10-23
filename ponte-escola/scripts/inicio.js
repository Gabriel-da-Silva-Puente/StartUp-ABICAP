document.addEventListener("DOMContentLoaded", async () => {
    
    const idLogado = localStorage.getItem('usuarioLogadoId');
    
    if (!idLogado) return; 

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
});