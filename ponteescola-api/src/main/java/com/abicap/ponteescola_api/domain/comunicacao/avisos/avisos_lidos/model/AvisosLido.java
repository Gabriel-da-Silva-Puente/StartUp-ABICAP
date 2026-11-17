package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos_lidos.model;

import com.abicap.ponteescola_api.domain.acesso.aluno.model.Aluno;
import com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.model.Avisos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "avisos_lidos")
public class AvisosLido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "lido_em", nullable = false)
    private OffsetDateTime lidoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "aviso_id")
    private Avisos avisos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;


}