package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DTOAvisosForm(
        @NotBlank(message = "Campo Obrigatório")
        @Size(min = 3, max = 100)
        String titulo,
        @NotNull(message = "Campo Obrigatório")
        String tipo,
        @NotBlank(message = "Campo Obrigatório")
        @Size(min = 3, max = 2000)
        String descricao,
        @NotNull(message = "Campo Obrigatório")
        LocalDate dataEvento,
        @NotBlank(message = "Campo Obrigatório")
        Long turmaId
) {
}
