package iteam.salesapi.dto;

import lombok.Builder;
import lombok.Data;

import iteam.salesapi.util.TypePointVente;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PointDeVenteResponseDTO {

    // =====================================
    // INFORMATIONS GENERALES
    // =====================================

    private Long id;

    private String nom;

    private String code;

    private String adresse;

    private String ville;

    private String telephone;

    private Boolean actif;

    // =====================================
    // TYPE
    // =====================================

    private TypePointVente type;

    // =====================================
    // ENTREPRISE
    // =====================================
    // AJOUTER ÇA
    private Long entrepriseId;
    private String entrepriseNom;

    // =====================================
    // RESPONSABLE
    // =====================================

    private Long responsableId;
    private String responsableNom;
    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;
}
