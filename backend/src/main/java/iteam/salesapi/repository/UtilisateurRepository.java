package iteam.salesapi.repository;

import iteam.salesapi.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    @Query("""
        SELECT u FROM Utilisateur u
        LEFT JOIN FETCH u.entreprise
        WHERE u.email = :email
    """)
    Optional<Utilisateur> findByEmailWithEntreprise(@Param("email") String email);
    
    //  NOUVEAU : Filtrer par entreprise
    List<Utilisateur> findByEntrepriseId(Long entrepriseId);
}
