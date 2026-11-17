package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.mapper;

import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.dto.DTOAvisosForm;
import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.model.Avisos;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AvisosMapper {

    Avisos toEntity(DTOAvisosForm aviso);

    DTOAvisosForm toDTO(Avisos avisos);

}
