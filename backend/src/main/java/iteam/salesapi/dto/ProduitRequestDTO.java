package iteam.salesapi.dto;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProduitRequestDTO {

    private String nom;
    private String code;
    private double prix;
    private String barcode;
    private String imageUrl;
    private Integer stockMinimum;
    private Boolean actif;

    private Long entrepriseId;
    private Long categorieId;
    private Long taxeId;

    //
    private String taxeNom;
    private double taxeTaux;
}
