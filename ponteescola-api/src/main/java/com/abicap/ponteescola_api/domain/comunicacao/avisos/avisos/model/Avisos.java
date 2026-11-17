package com.abicap.ponteescola_api.domain.comunicacao.avisos.avisos.model;

import com.abicap.ponteescola_api.domain.acesso.administrador.model.Administrador;
import com.abicap.ponteescola_api.domain.turma.turma.model.Turma;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "avisos")
public class Avisos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "titulo", length = Integer.MAX_VALUE)
    private String titulo;

    @Column(name = "tipo", length = Integer.MAX_VALUE)
    private String tipo;

    @Column(name = "descricao", length = Integer.MAX_VALUE)
    private String descricao;

    @Column(name = "data_evento")
    private LocalDate dataEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id")
    private Administrador autor;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "turma_id")
    private Turma turma;


}