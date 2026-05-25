package iteam.salesapi.repository;

import iteam.salesapi.entity.Taxe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface TaxeRepository extends JpaRepository<Taxe, Long> {
    List<Taxe> findByEntrepriseId(Long entrepriseId);
    Optional<Taxe> findByIdAndEntrepriseId(Long id, Long entrepriseId);
}
