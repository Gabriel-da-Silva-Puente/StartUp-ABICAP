package com.abicap.ponteescola_api.domain.comunicacao.conversas.model;

import com.abicap.ponteescola_api.domain.acesso.responsavel.model.Responsavel;

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
@Table(name = "conversas")
public class Conversa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "responsavel_id")
    private Responsavel responsavel;

    @Column(name = "assunto", nullable = false, length = Integer.MAX_VALUE)
    private String assunto;

    @ColumnDefault("'aberto'")
    @Column(name = "status", length = Integer.MAX_VALUE)
    private String status;

    @ColumnDefault("false")
    @Column(name = "lida_pelo_admin")
    private Boolean lidaPeloAdmin;

    @Column(name = "anexo_url", length = Integer.MAX_VALUE)
    private String anexoUrl;


}