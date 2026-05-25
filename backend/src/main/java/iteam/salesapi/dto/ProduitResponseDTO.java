package iteam.salesapi.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProduitResponseDTO {

    private Long id;
    private String nom;
    private String code;
    private double prix;
    private int quantite;
    private String barcode;
    private String imageUrl;
    private Integer stockMinimum;
    private Boolean actif;

    private Long entrepriseId;
    private String entrepriseNom;
    private Long categorieId;
    private String categorieNom;
    private Long taxeId;

    //
    private String taxeNom;
    private double taxeTaux;
}
