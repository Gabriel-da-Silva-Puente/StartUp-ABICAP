package com.abicap.ponteescola_api.domain.ocorrencias.ocorrencias.model;

import com.abicap.ponteescola_api.domain.acesso.administrador.model.Administrador;
import com.abicap.ponteescola_api.domain.acesso.aluno.model.Aluno;
import com.abicap.ponteescola_api.domain.turma.turma.model.Turma;

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
@Table(name = "ocorrencias")
public class Ocorrencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "autor_id")
    private Administrador autor;

    @Column(name = "tipo", nullable = false, length = Integer.MAX_VALUE)
    private String tipo;

    @Column(name = "descricao", nullable = false, length = Integer.MAX_VALUE)
    private String descricao;

    @ColumnDefault("'aberto'")
    @Column(name = "status", length = Integer.MAX_VALUE)
    private String status;

    @Column(name = "gravidade", length = Integer.MAX_VALUE)
    private String gravidade;

    @Column(name = "providencias", length = Integer.MAX_VALUE)
    private String providencias;

    @ColumnDefault("false")
    @Column(name = "acompanhamento")
    private Boolean acompanhamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "turma_id")
    private Turma turma;


}