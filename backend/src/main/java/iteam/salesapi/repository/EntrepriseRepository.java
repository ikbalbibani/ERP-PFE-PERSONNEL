package iteam.salesapi.repository;

import iteam.salesapi.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    @Query("SELECT e FROM Entreprise e WHERE e.id = :id")
    Entreprise findByIdSimple(@Param("id") Long id);
}