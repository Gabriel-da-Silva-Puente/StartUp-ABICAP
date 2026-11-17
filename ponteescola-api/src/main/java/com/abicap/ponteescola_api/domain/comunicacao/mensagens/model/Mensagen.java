package com.abicap.ponteescola_api.domain.comunicacao.mensagens.model;

import com.abicap.ponteescola_api.domain.comunicacao.conversas.model.Conversa;

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
@Table(name = "mensagens")
public class Mensagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "conversa_id")
    private Conversa conversa;

    @Column(name = "remetente", nullable = false, length = Integer.MAX_VALUE)
    private String remetente;

    @Column(name = "texto", nullable = false, length = Integer.MAX_VALUE)
    private String texto;


}