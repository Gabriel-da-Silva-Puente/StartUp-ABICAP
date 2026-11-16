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


// ---------------- OCORRÊNCIAS: GRAVIDADE E PROVIDÊNCIAS (visão do responsável) ----------------
const GRAVIDADE_OCORRENCIA = {
    leve:  { rotulo: "Leve",  orientacao: "Registro informativo. Nenhuma ação é necessária." },
    media: { rotulo: "Média", orientacao: "Fique atento e converse com seu filho(a) sobre o ocorrido." },
    grave: { rotulo: "Grave", orientacao: "Recomendamos que entre em contato com a coordenação o quanto antes." }
};

// Monta o bloco "Gravidade / Providências / Acompanhamento" do modal. Devolve '' se não houver nada a mostrar.
function montarDetalhesOcorrencia(o) {
    const grav = GRAVIDADE_OCORRENCIA[o.gravidade];
    const providencias = (o.providencias || '').trim();
    if (!grav && !providencias && !o.acompanhamento) return '';

    return `
        <div class="ocorrencia-detalhes">
            ${grav ? `
                <div class="ocorrencia-detalhe">
                    <span class="ocorrencia-detalhe-rotulo">Gravidade</span>
                    <span class="badge-gravidade gravidade-${o.gravidade}">${grav.rotulo}</span>
                    <p class="ocorrencia-detalhe-texto">${grav.orientacao}</p>
                </div>` : ''}
            <div class="ocorrencia-detalhe">
                <span class="ocorrencia-detalhe-rotulo">Providências tomadas pela escola</span>
                <p class="ocorrencia-detalhe-texto">${providencias ? escaparHtml(providencias) : 'Nenhuma providência registrada até o momento.'}</p>
            </div>
            ${o.acompanhamento ? `
                <div class="ocorrencia-detalhe">
                    <span class="ocorrencia-detalhe-rotulo">Acompanhamento</span>
                    <p class="ocorrencia-detalhe-texto">A escola vai acompanhar este caso de forma contínua.</p>
                </div>` : ''}
        </div>`;
}
