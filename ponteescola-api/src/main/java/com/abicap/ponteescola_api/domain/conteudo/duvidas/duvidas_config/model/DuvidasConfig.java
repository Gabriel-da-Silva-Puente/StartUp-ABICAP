package com.abicap.ponteescola_api.domain.conteudo.duvidas.duvidas_config.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "duvidas_config")
public class DuvidasConfig {
    @Id
    @ColumnDefault("1")
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "texto_geral", length = Integer.MAX_VALUE)
    private String textoGeral;


}