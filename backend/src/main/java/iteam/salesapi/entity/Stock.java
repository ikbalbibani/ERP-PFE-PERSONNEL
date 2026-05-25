package iteam.salesapi.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantite;

    //   produit
    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Produit produit;

    //   point de vente
    @ManyToOne
    @JoinColumn(name = "point_vente_id")
    private PointDeVente pointDeVente;

    @JsonIgnore
    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<StockMovement> movements = new ArrayList<>();
}
