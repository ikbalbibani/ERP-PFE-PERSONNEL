package iteam.salesapi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import iteam.salesapi.util.TypeEntreprise;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "entreprise")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Entreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // INFORMATIONS PRINCIPALES
    // =========================

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // ex: ENT001

    @Column(length = 500)
    private String description;

    // Type entreprise
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEntreprise typeEntreprise;

    // =========================
    // CONTACT
    // =========================

    private String email;

    private String telephone;

    private String siteWeb;

    // =========================
    // ADRESSE
    // =========================

    private String adresse;

    private String ville;

    private String pays;

    // =========================
    // CONFIGURATION
    // =========================

    private String devise; // TND, EUR...

    private String langue; // FR, EN...

    // =========================
    // FISCALITE
    // =========================

    private String matriculeFiscal;

    private String registreCommerce;

    // =========================
    // BRANDING
    // =========================

    private String logoUrl;

    // =========================
    // SYSTEME
    // =========================

    @Column(nullable = false)
    private Boolean actif;

    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    // =========================
    // AUTO DATE CREATION exécuté AVANT INSERT.
    // =========================

    @PrePersist
    public void prePersist() {

        this.dateCreation = LocalDateTime.now();

        this.dateModification = LocalDateTime.now();

        if (this.actif == null) {
            this.actif = true;
        }
    }

    // =========================
    // AUTO DATE UPDATE exécuté AVANT UPDATE..
    // =========================

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}