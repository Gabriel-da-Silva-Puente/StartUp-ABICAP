package com.abicap.ponteescola_api.domain.eventos.autorizacoes.autorizacoes.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "autorizacoes")
public class Autorizacoe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "titulo", length = Integer.MAX_VALUE)
    private String titulo;

    @Column(name = "descricao", length = Integer.MAX_VALUE)
    private String descricao;

    @Column(name = "local", length = Integer.MAX_VALUE)
    private String local;

    @Column(name = "data_evento")
    private LocalDate dataEvento;

    @Column(name = "prazo_limite")
    private LocalDate prazoLimite;

    @Column(name = "status", length = Integer.MAX_VALUE)
    private String status;


}