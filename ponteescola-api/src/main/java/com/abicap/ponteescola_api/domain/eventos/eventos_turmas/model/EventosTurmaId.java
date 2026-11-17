package com.abicap.ponteescola_api.domain.eventos.eventos_turmas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class EventosTurmaId implements Serializable {
    @Serial
    private static final long serialVersionUID = 657231829936181400L;
    @Column(name = "evento_id", nullable = false)
    private Long eventoId;

    @Column(name = "turma_id", nullable = false)
    private Long turmaId;


}