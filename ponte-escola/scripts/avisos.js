(function () {
    
    const modal = document.getElementById("modal-aviso");
    const btnNovo = document.getElementById("btn-novo-aviso");
    const btnCancelar = document.getElementById("btn-cancelar-aviso");
    const form = document.getElementById("form-aviso");
    const btnFechar = document.getElementById("btn-fechar-modal");

    
    btnNovo?.addEventListener("click", () => {
        form.reset(); 
        modal.showModal();
    });

    btnCancelar?.addEventListener("click", () => {
        modal.close();
    });

    btnFechar?.addEventListener("click", () => {
        modal.close()
    });

    // ESSA FUNCIONALIDADE SERA ADICIONADA FUTURAMENTE
    form?.addEventListener("submit", (e) => {
        e.preventDefault(); // NAO RECARREGHA A PAGINA
        
        // SERA UTILIZADO UM AvisoServico.criar() PARA LOGICA DE DADOS DO APP
        
        modal.close();
    });
})();