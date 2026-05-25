package iteam.salesapi.repository;

import iteam.salesapi.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByProduitCategorieEntrepriseId(Long entrepriseId);
}
