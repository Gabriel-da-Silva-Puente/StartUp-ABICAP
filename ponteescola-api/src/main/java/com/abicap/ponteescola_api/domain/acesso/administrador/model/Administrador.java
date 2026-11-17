package com.abicap.ponteescola_api.domain.acesso.administrador.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "administrador")
public class Administrador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "nome", length = Integer.MAX_VALUE)
    private String nome;

    @Column(name = "email", length = Integer.MAX_VALUE)
    private String email;

    @Column(name = "cpf", length = Integer.MAX_VALUE)
    private String cpf;

    @Column(name = "cargo", length = Integer.MAX_VALUE)
    private String cargo;

    @Column(name = "disciplina", length = Integer.MAX_VALUE)
    private String disciplina;

    @Column(name = "tipo", length = Integer.MAX_VALUE)
    private String tipo;

    @Column(name = "telefone", length = Integer.MAX_VALUE)
    private String telefone;


}