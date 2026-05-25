package iteam.salesapi.controller;


import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.service.EnterpriseService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
public class EnterpriseController {

    private final EnterpriseService service;

    public EnterpriseController(EnterpriseService service) {
        this.service = service;
    }

    // 🔹 GET ALL - Filtré par utilisateur
    @GetMapping
    public List<Entreprise> getAll(Authentication authentication) {
        return service.getAllForCurrentUser(authentication.getName());
    }

    // 🔹 GET BY ID - Vérification d'accès
    @GetMapping("/{id}")
    public Entreprise getById(@PathVariable Long id, Authentication authentication) {
        return service.getByIdForCurrentUser(id, authentication.getName());
    }

    // 🔹 CREATE - Seulement SUPER_ADMIN
    @PostMapping
    public Entreprise create(@RequestBody Entreprise e, Authentication authentication) {
        if (!hasRole(authentication, "SUPER_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Seul un SUPER_ADMIN peut créer une entreprise");
        }
        return service.create(e);
    }

    // 🔹 UPDATE - Vérification d'accès
    @PutMapping("/{id}")
    public Entreprise update(@PathVariable Long id, @RequestBody Entreprise e,
                           Authentication authentication) {
        // Vérifier que l'utilisateur peut modifier cette entreprise
        service.getByIdForCurrentUser(id, authentication.getName());
        return service.update(id, e);
    }

    // 🔹 DELETE - Seulement SUPER_ADMIN
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        if (!hasRole(authentication, "SUPER_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Seul un SUPER_ADMIN peut supprimer une entreprise");
        }
        service.delete(id);
    }

    private boolean hasRole(Authentication auth, String roleName) {
        return auth.getAuthorities().stream()
                .anyMatch(authority ->
                        roleName.equals(authority.getAuthority()) ||
                                ("ROLE_" + roleName).equals(authority.getAuthority())
                );
    }
}
