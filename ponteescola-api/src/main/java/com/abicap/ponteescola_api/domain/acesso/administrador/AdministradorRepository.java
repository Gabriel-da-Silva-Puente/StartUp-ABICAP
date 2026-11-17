package com.abicap.ponteescola_api.domain.acesso.administrador;

import com.abicap.ponteescola_api.domain.acesso.administrador.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {


}
