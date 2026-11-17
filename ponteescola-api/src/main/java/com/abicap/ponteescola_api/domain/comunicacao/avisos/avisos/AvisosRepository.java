package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos;

import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.model.Avisos;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvisosRepository extends JpaRepository<Avisos,  Long> {


}
