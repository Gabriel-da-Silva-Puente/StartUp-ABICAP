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
            .single();
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

    async excluir(id) {
        const { error } = await banco
            .from('turma')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

window.TurmasService = TurmasService;