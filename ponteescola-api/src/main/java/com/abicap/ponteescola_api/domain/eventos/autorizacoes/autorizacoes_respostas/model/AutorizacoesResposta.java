package com.abicap.ponteescola_api.domain.eventos.autorizacoes.autorizacoes_respostas.model;

import com.abicap.ponteescola_api.domain.acesso.aluno.model.Aluno;
import com.abicap.ponteescola_api.domain.eventos.autorizacoes.autorizacoes.model.Autorizacoe;

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
@Table(name = "autorizacoes_respostas")
public class AutorizacoesResposta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "autorizacao_id")
    private Autorizacoe autorizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @Column(name = "status", length = Integer.MAX_VALUE)
    private String status;


}