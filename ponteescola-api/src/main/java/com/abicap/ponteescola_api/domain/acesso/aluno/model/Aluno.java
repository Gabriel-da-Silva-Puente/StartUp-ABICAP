package com.abicap.ponteescola_api.domain.acesso.aluno.model;

import com.abicap.ponteescola_api.domain.acesso.responsavel.model.Responsavel;
import com.abicap.ponteescola_api.domain.turma.turma.model.Turma;

import com.abicap.ponteescola_api.domain.acesso.Responsavel;
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
@Table(name = "aluno")
public class Aluno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "nome", length = Integer.MAX_VALUE)
    private String nome;

    @Column(name = "idade")
    private Short idade;

    @Column(name = "alergias", length = Integer.MAX_VALUE)
    private String alergias;

    @Column(name = "condicoes_medicas", length = Integer.MAX_VALUE)
    private String condicoesMedicas;

    @Column(name = "medicamentos", length = Integer.MAX_VALUE)
    private String medicamentos;

    @Column(name = "restricoes_alimentares", length = Integer.MAX_VALUE)
    private String restricoesAlimentares;

    @Column(name = "autorizado_buscar", length = Integer.MAX_VALUE)
    private String autorizadoBuscar;

    @Column(name = "observacoes", length = Integer.MAX_VALUE)
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "turma_id")
    private Turma turma;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "responsavel_id")
    private Responsavel responsavel;


}