package iteam.salesapi.service;

import iteam.salesapi.dto.PointDeVenteRequestDTO;
import iteam.salesapi.dto.PointDeVenteResponseDTO;
import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.PointDeVente;
import iteam.salesapi.entity.Role;
import iteam.salesapi.entity.Utilisateur;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.repository.PointDeVenteRepository;
import iteam.salesapi.repository.RoleRepository;
import iteam.salesapi.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PointDeVenteService {

    private final PointDeVenteRepository repo;

    private final EntrepriseRepository entrepriseRepo;

    private final UtilisateurRepository utilisateurRepo;

    private final RoleRepository roleRepo;

    private final CurrentUserService currentUserService;

    public PointDeVenteService(
            PointDeVenteRepository repo,
            EntrepriseRepository entrepriseRepo,
            UtilisateurRepository utilisateurRepo,
            RoleRepository roleRepo,
            CurrentUserService currentUserService
    ) {

        this.repo = repo;
        this.entrepriseRepo = entrepriseRepo;
        this.utilisateurRepo = utilisateurRepo;
        this.roleRepo = roleRepo;
        this.currentUserService = currentUserService;
    }

    // ==================================================
    // CREATE
    // ==================================================

    public PointDeVenteResponseDTO create(
            PointDeVenteRequestDTO dto
    ) {

        // =====================================
        // VALIDATION NOM
        // =====================================

        if (dto.getNom() == null ||
                dto.getNom().isBlank()) {

            throw new RuntimeException(
                    "Nom point de vente obligatoire"
            );
        }

        Entreprise currentEntreprise = null;
        if (!currentUserService.isSuperAdmin()) {
            currentEntreprise = currentUserService.getCurrentEntreprise();
            if (dto.getEntrepriseId() != null &&
                    !dto.getEntrepriseId().equals(currentEntreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
            dto.setEntrepriseId(currentEntreprise.getId());
        }

        // =====================================
        // VERIFIER ENTREPRISE ID
        // =====================================

        if (dto.getEntrepriseId() == null) {

            throw new RuntimeException(
                    "Veuillez sélectionner une entreprise"
            );
        }

        // =====================================
        // VERIFIER RESPONSABLE ID
        // =====================================

        if (dto.getResponsableId() == null) {

            throw new RuntimeException(
                    "Veuillez sélectionner un responsable"
            );
        }

        // =====================================
        // VERIFIER ENTREPRISE
        // =====================================

        Entreprise entreprise =
                entrepriseRepo.findById(
                                dto.getEntrepriseId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entreprise not found"
                                ));

        // =====================================
        // VERIFIER RESPONSABLE
        // =====================================

        Utilisateur responsable =
                utilisateurRepo.findById(
                                dto.getResponsableId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Responsable not found"
                                ));

        // =====================================
        // RESPONSABLE SANS ENTREPRISE
        // =====================================

        if (responsable.getEntreprise() == null) {

            // affecter automatiquement entreprise
            responsable.setEntreprise(entreprise);

            utilisateurRepo.save(responsable);
        }

        // =====================================
        // ENTREPRISE DIFFERENTE
        // =====================================

        else if (!responsable.getEntreprise()
                .getId()
                .equals(dto.getEntrepriseId())) {

            throw new RuntimeException(
                    "Le responsable appartient à une autre entreprise"
            );
        }

        // =====================================
        // AJOUT ROLE ADMIN_ENTREPRISE SI ABSENT
        // =====================================

        boolean hasAdminEntrepriseRole =
                responsable.getRoles()
                        .stream()
                        .anyMatch(role ->

                                role.getNom()
                                        .equals("ADMIN_ENTREPRISE")
                        );

        if (!hasAdminEntrepriseRole) {

            Role adminRole =
                    roleRepo.findByNom(
                                    "ADMIN_ENTREPRISE"
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Role ADMIN_ENTREPRISE introuvable"
                                    ));

            responsable.getRoles()
                    .add(adminRole);

            utilisateurRepo.save(responsable);
        }

        // =====================================
        // CREATION
        // =====================================

        PointDeVente p = new PointDeVente();

        p.setNom(dto.getNom());

        p.setCode(dto.getCode());

        p.setAdresse(dto.getAdresse());

        p.setVille(dto.getVille());

        p.setTelephone(dto.getTelephone());

        p.setActif(dto.getActif());

        p.setType(dto.getType());

        p.setEntreprise(entreprise);

        p.setResponsable(responsable);

        return mapToDTO(repo.save(p));
    }

    // ==================================================
    // GET ALL
    // ==================================================

    public List<PointDeVenteResponseDTO> getAll() {

        if (currentUserService.isSuperAdmin()) {
            return repo.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .toList();
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();

        return repo.findByEntrepriseId(entreprise.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ==================================================
    // GET BY ID
    // ==================================================

    public PointDeVenteResponseDTO getById(
            Long id
    ) {

        PointDeVente p =
                repo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Point de vente not found"
                                ));

        return mapToDTO(p);
    }

    // ==================================================
    // GET BY ENTREPRISE
    // ==================================================

    public List<PointDeVenteResponseDTO>
    getByEntreprise(Long entrepriseId) {

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (!entreprise.getId().equals(entrepriseId)) {
                throw new UnauthorizedException("Accès refusé");
            }
        }

        return repo.findByEntrepriseId(
                        entrepriseId
                )
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ==================================================
    // UPDATE
    // ==================================================

    public PointDeVenteResponseDTO update(
            Long id,
            PointDeVenteRequestDTO dto
    ) {

        PointDeVente p =
                repo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Point de vente not found"
                                ));

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (!p.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
            if (dto.getEntrepriseId() != null &&
                    !dto.getEntrepriseId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
            dto.setEntrepriseId(entreprise.getId());
        }

        // =====================================
        // RESPONSABLE
        // =====================================

        Utilisateur responsable =
                utilisateurRepo.findById(
                                dto.getResponsableId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Responsable not found"
                                ));

        // =====================================
        // RESPONSABLE SANS ENTREPRISE
        // =====================================

        if (responsable.getEntreprise() == null) {

            responsable.setEntreprise(p.getEntreprise());

            utilisateurRepo.save(responsable);
        }

        // =====================================
        // ENTREPRISE DIFFERENTE
        // =====================================

        else if (!responsable.getEntreprise()
                .getId()
                .equals(dto.getEntrepriseId())) {

            throw new RuntimeException(
                    "Le responsable appartient à une autre entreprise"
            );
        }

        // =====================================
        // AJOUT ROLE ADMIN_ENTREPRISE SI ABSENT
        // =====================================

        boolean hasAdminEntrepriseRole =
                responsable.getRoles()
                        .stream()
                        .anyMatch(role ->

                                role.getNom()
                                        .equals("ADMIN_ENTREPRISE")
                        );

        if (!hasAdminEntrepriseRole) {

            Role adminRole =
                    roleRepo.findByNom(
                                    "ADMIN_ENTREPRISE"
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Role ADMIN_ENTREPRISE introuvable"
                                    ));

            responsable.getRoles()
                    .add(adminRole);

            utilisateurRepo.save(responsable);
        }

        // =====================================
        // UPDATE
        // =====================================

        p.setNom(dto.getNom());

        p.setCode(dto.getCode());

        p.setAdresse(dto.getAdresse());

        p.setVille(dto.getVille());

        p.setTelephone(dto.getTelephone());

        p.setActif(dto.getActif());

        p.setType(dto.getType());

        p.setResponsable(responsable);

        return mapToDTO(repo.save(p));
    }

    // ==================================================
    // DELETE
    // ==================================================

    public void delete(Long id) {

        PointDeVente p =
                repo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Point de vente not found"
                                ));

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (!p.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
        }

        repo.delete(p);
    }

    // ==================================================
    // ENTITY -> DTO
    // ==================================================

    private PointDeVenteResponseDTO mapToDTO(
            PointDeVente p
    ) {

        return PointDeVenteResponseDTO.builder()

                .id(p.getId())

                .nom(p.getNom())

                .code(p.getCode())

                .adresse(p.getAdresse())

                .ville(p.getVille())

                .telephone(p.getTelephone())

                .actif(p.getActif())

                .type(p.getType())

                .entrepriseId(
                        p.getEntreprise() != null
                                ? p.getEntreprise().getId()
                                : null
                )

                .entrepriseNom(
                        p.getEntreprise() != null
                                ? p.getEntreprise().getNom()
                                : null
                )

                .responsableId(
                        p.getResponsable() != null
                                ? p.getResponsable().getId()
                                : null
                )

                .responsableNom(
                        p.getResponsable() != null
                                ? p.getResponsable().getNom()
                                : null
                )

                .dateCreation(
                        p.getDateCreation()
                )

                .dateModification(
                        p.getDateModification()
                )

                .build();
    }
}
