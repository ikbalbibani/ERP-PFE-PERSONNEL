package iteam.salesapi.entity;

import jakarta.persistence.*;
import lombok.*;

/**

 * Représente un produit dans le système ERP.
   Contient uniquement les informations générales :
 * - nom
 * - code unique
 * - prix de vente
 * - catégorie
 * - taxe (TVA)
 *  IMPORTANT :
 * Le produit NE contient PAS la quantité en stock.
 *   Le stock est géré séparément dans l'entité Stock
 * afin de permettre :
 * - gestion multi points de vente
 * - gestion multi entreprises
 *  Exemple :
 * Produit = Coca
 * Stock = quantité différente dans chaque magasin
 */

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String code;
    private double prix;
    private String barcode;
    private String imageUrl;
    private Integer stockMinimum;
    private Boolean actif;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @ManyToOne
    @JoinColumn(name = "taxe_id")
    private Taxe taxe;

    @PrePersist
    public void prePersist() {
        if (actif == null) {
            actif = true;
        }
        if (stockMinimum == null) {
            stockMinimum = 0;
        }
    }
}
