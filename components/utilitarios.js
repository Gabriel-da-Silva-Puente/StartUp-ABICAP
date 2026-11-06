// Funções compartilhadas pelas páginas do administrador.

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

let _temporizadorAviso = null;
function mostrarAviso(mensagem) {
    const el = document.getElementById('aviso-flutuante');
    if (!el) return;
    el.textContent = mensagem;
    el.classList.add('visivel');
    clearTimeout(_temporizadorAviso);
    _temporizadorAviso = setTimeout(() => el.classList.remove('visivel'), 2600);
}

// Data local (sem deslocamento de fuso) no formato YYYY-MM-DD
function dataParaISO(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dia}`;
}

// Converte YYYY-MM-DD em Date local
function isoParaData(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d);
}

window.escaparHtml = escaparHtml;
window.mostrarAviso = mostrarAviso;
window.dataParaISO = dataParaISO;
window.isoParaData = isoParaData;
