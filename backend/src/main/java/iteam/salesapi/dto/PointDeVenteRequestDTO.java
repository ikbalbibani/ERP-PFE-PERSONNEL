package iteam.salesapi.dto;

import iteam.salesapi.util.TypePointVente;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PointDeVenteRequestDTO {

    // =====================================
    // INFORMATIONS GENERALES
    // =====================================

    private String nom;

    private String code;

    private String adresse;

    private String ville;

    private String telephone;

    private Boolean actif;

    // =====================================
    // TYPE POINT DE VENTE
    // =====================================

    private TypePointVente type;

    // =====================================
    // ENTREPRISE
    // =====================================

    private Long entrepriseId;

    // =====================================
    // RESPONSABLE
    // =====================================

    private Long responsableId;
    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;
}