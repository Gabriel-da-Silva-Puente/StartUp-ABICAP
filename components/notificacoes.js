// Sino de notificações simples: busca uma lista de itens, mostra a contagem
// e abre um painel com links ao clicar. Sem dados guardados: o que aparece
// vem do estado atual do banco (ex.: mensagens ainda não lidas).

(function () {
    const CSS = `
    .notif-painel{position:absolute;right:0;top:calc(100% + .5rem);width:300px;max-height:360px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:1000;text-align:left}
    .notif-painel[hidden]{display:none}
    .notif-titulo{padding:.75rem 1rem;font-weight:600;font-size:.9rem;border-bottom:1px solid #E2E8F0}
    .notif-item{display:block;padding:.75rem 1rem;border-bottom:1px solid #F1F5F9;color:inherit;text-decoration:none;font-size:.85rem}
    .notif-item:hover{background:#F8FAFC}
    .notif-item small{display:block;color:#64748B;margin-top:.15rem}
    .notif-vazio{padding:1rem;color:#64748B;font-size:.85rem}`;

    const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const haHoras = (h) => new Date(Date.now() - h * 3600000).toISOString();

    // ADMINISTRAÇÃO: mensagens não lidas + ocorrências das últimas 48h
    async function notificacoesAdmin() {
        const itens = [];
        const { data: conversas } = await banco.from('conversas').select('id, assunto').eq('lida_pelo_admin', false);
        (conversas || []).forEach(c => itens.push({
            texto: 'Nova mensagem', detalhe: c.assunto, href: 'administrador-mensagens.html'
        }));
        const { data: ocs } = await banco.from('ocorrencias').select('id, tipo').gte('created_at', haHoras(48));
        (ocs || []).forEach(o => itens.push({
            texto: 'Ocorrência registrada', detalhe: `Tipo: ${o.tipo} (últimas 48h)`, href: 'administrador-ocorrencias.html'
        }));
        return itens;
    }

    // PROFESSOR: comentários novos no mural (72h) + atividades com prazo em até 2 dias
    async function notificacoesProfessor() {
        const turmaId = localStorage.getItem('turmaVisualizadaId');
        if (!turmaId) return [];
        const itens = [];

        const { data: posts } = await banco.from('mural_posts').select('id').eq('turma_id', turmaId);
        const ids = (posts || []).map(p => p.id);
        if (ids.length) {
            const { data: coms } = await banco.from('mural_comentarios')
                .select('id, autor_nome').in('post_id', ids).gte('created_at', haHoras(72));
            (coms || []).forEach(c => itens.push({
                texto: 'Novo comentário no mural', detalhe: `de ${c.autor_nome || 'responsável'}`, href: 'muralDaTurma.html'
            }));
        }

        const hoje = new Date(), limite = new Date();
        limite.setDate(hoje.getDate() + 2);
        const { data: ativ } = await banco.from('atividades')
            .select('id, titulo, prazo').eq('turma_id', turmaId).gte('prazo', iso(hoje)).lte('prazo', iso(limite));
        (ativ || []).forEach(a => itens.push({
            texto: 'Atividade com prazo próximo', detalhe: `${a.titulo} — até ${a.prazo.split('-').reverse().join('/')}`, href: 'atividades.html'
        }));
        return itens;
    }

    async function ativarNotificacoes(buscarItens) {
        const btn = document.getElementById('btn-notificacoes');
        if (!btn) return;

        if (!document.getElementById('notif-css')) {
            const st = document.createElement('style');
            st.id = 'notif-css'; st.textContent = CSS;
            document.head.appendChild(st);
        }

        let itens = [];
        try { itens = await buscarItens(); } catch (e) { console.error('Erro nas notificações:', e); }

        const badge = btn.querySelector('.topo-badge');
        if (badge) { badge.textContent = itens.length; badge.style.display = itens.length ? '' : 'none'; }

        const pai = btn.parentElement;
        pai.style.position = 'relative';
        const painel = document.createElement('div');
        painel.className = 'notif-painel';
        painel.hidden = true;
        painel.innerHTML = `<div class="notif-titulo">Notificações</div>` + (itens.length
            ? itens.map(i => `<a class="notif-item" href="${esc(i.href)}">${esc(i.texto)}<small>${esc(i.detalhe || '')}</small></a>`).join('')
            : `<div class="notif-vazio">Nenhuma notificação nova.</div>`);
        pai.appendChild(painel);

        btn.addEventListener('click', () => { painel.hidden = !painel.hidden; });
        document.addEventListener('click', (e) => { if (!pai.contains(e.target)) painel.hidden = true; });
    }

    window.ativarNotificacoes = ativarNotificacoes;
    window.notificacoesAdmin = notificacoesAdmin;
    window.notificacoesProfessor = notificacoesProfessor;
})();
