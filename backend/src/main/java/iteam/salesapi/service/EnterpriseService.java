package iteam.salesapi.service;


import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.Utilisateur;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EnterpriseService {

    private final EntrepriseRepository repo;
    private final UtilisateurRepository utilisateurRepo;

    public EnterpriseService(
            EntrepriseRepository repo,
            UtilisateurRepository utilisateurRepo
    ) {
        this.repo = repo;
        this.utilisateurRepo = utilisateurRepo;
    }

    //   GET ALL
    public List<Entreprise> getAll() {
        return repo.findAll();
    }

    public List<Entreprise> getAllForCurrentUser(String email) {
        Utilisateur currentUser = getCurrentUser(email);

        if (hasRole(currentUser, "SUPER_ADMIN")) {
            return repo.findAll();
        }

        if (currentUser.getEntreprise() == null) {
            return List.of();
        }

        return List.of(currentUser.getEntreprise());
    }

    //   GET BY ID
    public Entreprise getById(Long id) {

        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise not found"));
    }

    public Entreprise getByIdForCurrentUser(Long id, String email) {
        Utilisateur currentUser = getCurrentUser(email);
        Entreprise entreprise = getById(id);

        if (hasRole(currentUser, "SUPER_ADMIN")) {
            return entreprise;
        }

        if (
                currentUser.getEntreprise() != null &&
                currentUser.getEntreprise().getId().equals(id)
        ) {
            return entreprise;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Acces interdit a cette entreprise"
        );
    }

    //   CREATE
    public Entreprise create(Entreprise e) {
        return repo.save(e);
    }

    //   UPDATE
    public Entreprise update(Long id, Entreprise newData) {
        Entreprise e = getById(id);

        e.setNom(newData.getNom());
        e.setCode(newData.getCode());
        e.setEmail(newData.getEmail());
        e.setTelephone(newData.getTelephone());
        e.setDevise(newData.getDevise());

        return repo.save(e);
    }

    //   DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }

    private Utilisateur getCurrentUser(String email) {
        return utilisateurRepo.findByEmailWithEntreprise(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Utilisateur connecte introuvable"
                ));
    }

    private boolean hasRole(Utilisateur user, String roleName) {
        return user.getRoles()
                .stream()
                .anyMatch(role -> roleName.equals(role.getNom()));
    }
}
