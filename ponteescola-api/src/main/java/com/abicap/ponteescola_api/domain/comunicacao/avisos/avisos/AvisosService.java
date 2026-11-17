package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos;

import com.abicap.ponteescola_api.common.exceptions.AdministradorNaoEncontradoException;
import com.abicap.ponteescola_api.domain.acesso.administrador.AdministradorRepository;
import com.abicap.ponteescola_api.domain.acesso.administrador.model.Administrador;
import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.dto.DTOAvisosForm;
import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.mapper.AvisosMapper;
import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.model.Avisos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvisosService {

    private final AvisosRepository avisosRepository;
    private final AdministradorRepository  administradorRepository;
    private final AvisosMapper avisosMapper;

    public void criarAviso(DTOAvisosForm avisoDTO) {
        Avisos aviso = avisosMapper.toEntity(avisoDTO);
        Administrador administrador = administradorRepository.findById(9202L)
                .orElseThrow(() -> new AdministradorNaoEncontradoException("Esse administrador não existe"));

        aviso.setAutor(administrador);
    }
}
