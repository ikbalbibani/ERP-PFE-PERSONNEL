package iteam.salesapi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import iteam.salesapi.util.TypePointVente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "point_de_vente")
public class PointDeVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================
    // INFORMATIONS GENERALES
    // =====================================

    @Column(nullable = false)
    private String nom;

    @Column(unique = true, nullable = false)
    private String code;

    private String adresse;

    private String ville;

    private String telephone;

    private Boolean actif = true;

    // =====================================
    // TYPE POINT DE VENTE
    // =====================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePointVente type;

    // =====================================
    // ENTREPRISE
    // =====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    // =====================================
    // UTILISATEURS AFFECTES
    // =====================================

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "point_vente_utilisateurs",

            joinColumns =
            @JoinColumn(name = "point_vente_id"),

            inverseJoinColumns =
            @JoinColumn(name = "utilisateur_id")
    )
    private Set<Utilisateur> utilisateurs;
    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;
    // =====================================
    // RESPONSABLE PRINCIPAL
    // =====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Utilisateur responsable;
    @PrePersist
    public void prePersist() {

        this.dateCreation = LocalDateTime.now();

        this.actif = true;
    }

    @PreUpdate
    public void preUpdate() {

        this.dateModification = LocalDateTime.now();
    }
}