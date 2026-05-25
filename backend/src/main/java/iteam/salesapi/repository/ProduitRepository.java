package iteam.salesapi.repository;


import iteam.salesapi.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByCategorieEntrepriseId(Long entrepriseId);
}
