package iteam.salesapi.repository;

import iteam.salesapi.entity.PointDeVente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointDeVenteRepository extends JpaRepository<PointDeVente, Long> {

    List<PointDeVente> findByEntrepriseId(Long entrepriseId);
}
