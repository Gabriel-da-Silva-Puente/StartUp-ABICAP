package com.abicap.ponteescola_api.domain.acesso.responsavel.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "responsavel")
public class Responsavel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "\"Nome\"", length = Integer.MAX_VALUE)
    private String nome;

    @Column(name = "\"Idade\"")
    private Integer idade;

    @Column(name = "email", length = Integer.MAX_VALUE)
    private String email;

    @Column(name = "cpf", length = Integer.MAX_VALUE)
    private String cpf;

    @Column(name = "parentesco", length = Integer.MAX_VALUE)
    private String parentesco;

    @Column(name = "autorizacao_imagem")
    private Boolean autorizacaoImagem;

    @Column(name = "whatsapp", length = Integer.MAX_VALUE)
    private String whatsapp;

    @Column(name = "contato_emergencia", length = Integer.MAX_VALUE)
    private String contatoEmergencia;

    @Column(name = "notificacoes_ativas")
    private Boolean notificacoesAtivas;


}