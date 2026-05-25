package iteam.salesapi.service;

import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.Role;
import iteam.salesapi.entity.Utilisateur;
import iteam.salesapi.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UtilisateurRepository utilisateurRepo;

    public CurrentUserService(
            UtilisateurRepository utilisateurRepo
    ) {
        this.utilisateurRepo = utilisateurRepo;
    }

    public Utilisateur getCurrentUser() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = auth.getName();

        return utilisateurRepo
                .findByEmail(email)
                .orElseThrow();
    }

    public Entreprise getCurrentEntreprise() {

        return getCurrentUser()
                .getEntreprise();
    }

    public boolean isSuperAdmin() {
        return getCurrentUser().getRoles()
                .stream()
                .map(Role::getNom)
                .anyMatch("SUPER_ADMIN"::equals);
    }

    public boolean isAdminEntreprise() {
        return getCurrentUser().getRoles()
                .stream()
                .map(Role::getNom)
                .anyMatch("ADMIN_ENTREPRISE"::equals);
    }
}