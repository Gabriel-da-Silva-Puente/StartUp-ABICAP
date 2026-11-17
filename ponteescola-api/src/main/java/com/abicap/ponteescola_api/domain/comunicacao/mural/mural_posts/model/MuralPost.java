package com.abicap.ponteescola_api.domain.comunicacao.mural.mural_posts.model;

import com.abicap.ponteescola_api.domain.acesso.administrador.model.Administrador;
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
@Table(name = "mural_posts")
public class MuralPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id")
    private Administrador autor;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "turma_id")
    private Turma turma;

    @Column(name = "imagem_url", nullable = false, length = Integer.MAX_VALUE)
    private String imagemUrl;

    @Column(name = "legenda", length = Integer.MAX_VALUE)
    private String legenda;

    @ColumnDefault("0")
    @Column(name = "curtidas")
    private Integer curtidas;


}