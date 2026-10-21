const AdministradorService = {
    
    
    async buscarPerfilCompleto(id) {
    const { data, error } = await banco
        .from('administrador')
        .select(`
            *,
            professores_turmas!administrador_id (
                turma_id,
                turma ( id, nome )
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) throw error;
    return data;
}
};

window.AdministradorService = AdministradorService;