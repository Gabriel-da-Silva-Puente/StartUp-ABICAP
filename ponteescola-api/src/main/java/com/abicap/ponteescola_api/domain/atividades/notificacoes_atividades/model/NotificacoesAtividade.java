package com.abicap.ponteescola_api.domain.atividades.notificacoes_atividades.model;

import com.abicap.ponteescola_api.domain.acesso.aluno.model.Aluno;
import com.abicap.ponteescola_api.domain.atividades.atividades.model.Atividade;

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
@Table(name = "notificacoes_atividades")
public class NotificacoesAtividade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "atividade_id")
    private Atividade atividade;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ColumnDefault("false")
    @Column(name = "lida_pelo_pai")
    private Boolean lidaPeloPai;


}