package com.abicap.ponteescola_api.domain.conteudo.cardapio.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "cardapio")
public class Cardapio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "cafe", length = Integer.MAX_VALUE)
    private String cafe;

    @Column(name = "almoco", length = Integer.MAX_VALUE)
    private String almoco;

    @Column(name = "lanche", length = Integer.MAX_VALUE)
    private String lanche;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;


}