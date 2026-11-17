package com.abicap.ponteescola_api.domain.comunicacao.mural.mural_comentarios.model;

import com.abicap.ponteescola_api.domain.comunicacao.mural.mural_posts.model.MuralPost;

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
@Table(name = "mural_comentarios")
public class MuralComentario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ColumnDefault("now()")
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "post_id")
    private MuralPost post;

    @Column(name = "autor_nome", nullable = false, length = Integer.MAX_VALUE)
    private String autorNome;

    @Column(name = "texto", nullable = false, length = Integer.MAX_VALUE)
    private String texto;


}