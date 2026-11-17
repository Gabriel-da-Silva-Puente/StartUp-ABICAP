package com.abicap.ponteescola_api.domain.ocorrencias.ocorrencias_lidas.model;

import com.abicap.ponteescola_api.domain.acesso.aluno.model.Aluno;
import com.abicap.ponteescola_api.domain.ocorrencias.ocorrencias.model.Ocorrencia;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "ocorrencias_lidas")
public class OcorrenciasLida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "ocorrencia_id")
    private Ocorrencia ocorrencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;


}