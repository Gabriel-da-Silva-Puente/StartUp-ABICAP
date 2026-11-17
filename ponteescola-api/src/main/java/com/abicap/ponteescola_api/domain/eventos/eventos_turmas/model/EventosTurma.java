package com.abicap.ponteescola_api.domain.eventos.eventos_turmas.model;

import com.abicap.ponteescola_api.domain.eventos.eventos.model.Evento;
import com.abicap.ponteescola_api.domain.turma.turma.model.Turma;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "eventos_turmas")
public class EventosTurma {
    @EmbeddedId
    private EventosTurmaId id;

    @MapsId("eventoId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @MapsId("turmaId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;


}