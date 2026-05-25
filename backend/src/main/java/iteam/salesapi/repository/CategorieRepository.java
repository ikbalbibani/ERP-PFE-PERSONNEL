package iteam.salesapi.repository;

import iteam.salesapi.entity.Categorie;
import iteam.salesapi.util.TypeEntreprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {


        // ==================================================
        // GET ALL PAR ENTREPRISE
        // ==================================================

        List<Categorie> findByEntrepriseId(
                Long entrepriseId
        );

        // ==================================================
        // GET PAR TYPE + ENTREPRISE
        // ==================================================

        List<Categorie>
        findByEntreprise_TypeEntrepriseAndEntrepriseId(
                TypeEntreprise type,
                Long entrepriseId
        );

        List<Categorie> findByEntreprise_TypeEntreprise(
                TypeEntreprise type
        );

        // ==================================================
        // GET SOUS-CATEGORIES
        // ==================================================

        List<Categorie>
        findByParentIdAndEntrepriseId(
                Long parentId,
                Long entrepriseId
        );
    }
