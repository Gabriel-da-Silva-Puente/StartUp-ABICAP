const TurmasService = {

    async listarTodas() {
        const { data: turmas, error } = await banco.from('turma').select('*').order('nome');
        if (error) throw error;

        const turmasFormatadas = await Promise.all(turmas.map(async (turma) => {
            const { count: totalAlunos } = await banco
                .from('aluno').select('*', { count: 'exact', head: true }).eq('turma_id', turma.id);

            // Busca TODOS os professores da turma
            const { data: profsTurma } = await banco
                .from('professores_turmas')
                .select('administrador ( nome )')
                .eq('turma_id', turma.id);
                
            // Junta os nomes com vírgula (se houver mais de um)
            let nomesProfs = "Sem professor";
            if (profsTurma && profsTurma.length > 0) {
                nomesProfs = profsTurma.map(p => p.administrador?.nome).filter(Boolean).join(', ');
            }

            return {
                ...turma,
                total_alunos: totalAlunos || 0,
                professor_nome: nomesProfs
            };
        }));
        return turmasFormatadas;
    },

    async listarAlunos(turmaId) {
        const { data, error } = await banco.from('aluno').select('*').eq('turma_id', turmaId).order('nome');
        if (error) throw error;
        return data;
    },

    async buscarAlunoCompleto(alunoId) {
        const { data, error } = await banco
            .from('aluno')
            .select('*, responsavel ( nome, telefone )')
            .eq('id', alunoId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    async criar(nome, ano_letivo, turno, eh_jardim_infancia) {
        const { data, error } = await banco
            .from('turma')
            .insert([{ 
                nome, 
                ano_letivo: ano_letivo || null, 
                turno: turno || null, 
                eh_jardim_infancia: eh_jardim_infancia || false 
            }])
            .select();
        if (error) throw error;
        return data;
    },

    async atualizar(id, nome, ano_letivo, turno, eh_jardim_infancia) {
        const { data, error } = await banco
            .from('turma')
            .update({ 
                nome, 
                ano_letivo: ano_letivo || null, 
                turno: turno || null, 
                eh_jardim_infancia: eh_jardim_infancia || false 
            })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    },

    // Só exclui turma SEM alunos. Antes, apaga o que está preso à turma
    // (avisos, ocorrências, atividades, mural, vínculos), que era o que
    // impedia a exclusão por chave estrangeira.
    async excluir(id) {
        const { count, error: erroAlunos } = await banco
            .from('aluno').select('id', { count: 'exact', head: true }).eq('turma_id', id);
        if (erroAlunos) throw erroAlunos;
        if (count > 0) {
            const e = new Error('Turma possui alunos');
            e.codigo = 'TURMA_COM_ALUNOS';
            throw e;
        }

        // tabela da turma -> tabelas filhas (coluna que aponta para o registro)
        const dependencias = [
            ['avisos', [['avisos_lidos', 'aviso_id']]],
            ['ocorrencias', [['ocorrencias_lidas', 'ocorrencia_id']]],
            ['atividades', [['atividades_lidas', 'atividade_id'], ['notificacoes_atividades', 'atividade_id']]],
            ['mural_posts', [['mural_comentarios', 'post_id']]]
        ];
        for (const [tabela, filhas] of dependencias) {
            const { data: linhas, error } = await banco.from(tabela).select('id').eq('turma_id', id);
            if (error) throw error;
            const ids = (linhas || []).map(l => l.id);
            if (ids.length === 0) continue;
            for (const [filha, coluna] of filhas) {
                const { error: e1 } = await banco.from(filha).delete().in(coluna, ids);
                if (e1) throw e1;
            }
            const { error: e2 } = await banco.from(tabela).delete().eq('turma_id', id);
            if (e2) throw e2;
        }

        for (const vinculo of ['professores_turmas', 'autorizacoes_turmas', 'eventos_turmas']) {
            const { error } = await banco.from(vinculo).delete().eq('turma_id', id);
            if (error) throw error;
        }

        const { error } = await banco.from('turma').delete().eq('id', id);
        if (error) throw error;
    }
};

window.TurmasService = TurmasService;