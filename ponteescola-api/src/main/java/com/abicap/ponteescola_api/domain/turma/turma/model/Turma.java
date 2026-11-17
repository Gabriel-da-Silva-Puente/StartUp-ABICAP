package com.abicap.ponteescola_api.domain.turma.turma.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "turma")
public class Turma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "nome", length = Integer.MAX_VALUE)
    private String nome;

    @Column(name = "ano_letivo")
    private Integer anoLetivo;

    @Column(name = "turno", length = Integer.MAX_VALUE)
    private String turno;

    @Column(name = "eh_jardim_infancia")
    private Boolean ehJardimInfancia;


}