package iteam.salesapi.service;

import iteam.salesapi.dto.LoginRequestDTO;
import iteam.salesapi.dto.LoginResponseDTO;
import iteam.salesapi.dto.UtilisateurRequestDTO;
import iteam.salesapi.dto.UtilisateurResponseDTO;
import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.Role;
import iteam.salesapi.entity.Utilisateur;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.repository.RoleRepository;
import iteam.salesapi.repository.UtilisateurRepository;
import iteam.salesapi.security.JwtService;
import iteam.salesapi.service.CurrentUserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final JwtService jwtService;

    private final UtilisateurRepository userRepo;

    private final RoleRepository roleRepo;

    private final EntrepriseRepository entrepriseRepo;

    private final CurrentUserService currentUserService;

    private final BCryptPasswordEncoder passwordEncoder;

    // ==================================================
    // LOGIN
    // ==================================================

    public LoginResponseDTO login(LoginRequestDTO dto) {

        // chercher utilisateur
        Utilisateur user = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Email incorrect"));

        // vérifier password
        if (!passwordEncoder.matches(
                dto.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // récupérer rôles
        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getNom)
                .toList();

        // générer token
        String token = jwtService.generateToken(
                user.getEmail(),
                roles
        );

        return LoginResponseDTO.builder()
                .token(token)
                .build();
    }

    // ==================================================
    // CREATE USER
    // ==================================================

    public UtilisateurResponseDTO create(
            UtilisateurRequestDTO dto
    ) {

        // vérifier rôles
        if (dto.getRoleIds() == null ||
                dto.getRoleIds().isEmpty()) {

            throw new RuntimeException(
                    "Au moins un rôle est obligatoire"
            );
        }

        // charger rôles
        Set<Role> roles = dto.getRoleIds()
                .stream()
                .map(id -> roleRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role not found"
                                )))
                .collect(Collectors.toSet());

        // vérifier SUPER_ADMIN
        boolean isSuperAdmin = roles.stream()
                .anyMatch(role ->
                        role.getNom().equals("SUPER_ADMIN"));

        Entreprise entreprise = null;

        // entreprise obligatoire sauf SUPER_ADMIN
        if (!isSuperAdmin) {
            if (currentUserService.isAdminEntreprise()) {
                Entreprise currentEntreprise = currentUserService.getCurrentEntreprise();
                if (dto.getEntrepriseId() != null &&
                        !dto.getEntrepriseId().equals(currentEntreprise.getId())) {
                    throw new UnauthorizedException("Accès refusé");
                }
                entreprise = currentEntreprise;
            } else {
                if (dto.getEntrepriseId() == null) {
                    throw new RuntimeException(
                            "Entreprise obligatoire"
                    );
                }
                entreprise = entrepriseRepo
                        .findById(dto.getEntrepriseId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entreprise not found"
                                ));
            }
        }

        // création utilisateur
        Utilisateur user = new Utilisateur();

        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());

        user.setEmail(dto.getEmail());

        // encoder password
        user.setPassword(
                passwordEncoder.encode(
                        dto.getPassword()
                )
        );

        user.setCin(dto.getCin());

        user.setAge(dto.getAge());

        user.setGenre(dto.getGenre());

        user.setTelephone(dto.getTelephone());

        user.setAdresse(dto.getAdresse());

        user.setVille(dto.getVille());

        user.setPays(dto.getPays());

        user.setImageUrl(dto.getImageUrl());

        user.setEntreprise(entreprise);

        user.setRoles(roles);

        // sauvegarde
        Utilisateur saved = userRepo.save(user);

        return mapToDTO(saved);
    }

    // ==================================================
    // GET ALL
    // ==================================================

    public List<UtilisateurResponseDTO> getAll() {

        if (currentUserService.isSuperAdmin()) {
            return userRepo.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();

        return userRepo.findByEntrepriseId(entreprise.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ==================================================
    // GET BY ID
    // ==================================================

    public UtilisateurResponseDTO getById(Long id) {

        Utilisateur user = userRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Utilisateur not found"
                        ));

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (user.getEntreprise() == null ||
                    !user.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
        }

        return mapToDTO(user);
    }

    // ==================================================
    // UPDATE USER
    // ==================================================

    public UtilisateurResponseDTO update(
            Long id,
            UtilisateurRequestDTO dto
    ) {

        // vérifier utilisateur
        Utilisateur user = userRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Utilisateur not found"
                        ));

        // vérifier rôles
        if (dto.getRoleIds() == null ||
                dto.getRoleIds().isEmpty()) {

            throw new RuntimeException(
                    "Au moins un rôle est obligatoire"
            );
        }

        // charger rôles
        Set<Role> roles = dto.getRoleIds()
                .stream()
                .map(roleId -> roleRepo.findById(roleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Role not found"
                                )))
                .collect(Collectors.toSet());

        // vérifier SUPER_ADMIN
        boolean isSuperAdmin = roles.stream()
                .anyMatch(role ->
                        role.getNom().equals("SUPER_ADMIN"));

        Entreprise entreprise = null;

        if (dto.getEntrepriseId() != null) {
            entreprise = entrepriseRepo
                    .findById(dto.getEntrepriseId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Entreprise not found"
                            ));
        } else {
            entreprise = user.getEntreprise();
        }

        if (!isSuperAdmin) {
            if (entreprise == null) {
                throw new RuntimeException(
                        "Entreprise obligatoire"
                );
            }
            if (currentUserService.isAdminEntreprise()) {
                Entreprise currentEntreprise = currentUserService.getCurrentEntreprise();
                if (!entreprise.getId().equals(currentEntreprise.getId())) {
                    throw new UnauthorizedException("Accès refusé");
                }
            }
        }

        // update données
        user.setNom(dto.getNom());

        user.setPrenom(dto.getPrenom());

        user.setEmail(dto.getEmail());

        user.setCin(dto.getCin());

        user.setAge(dto.getAge());

        user.setGenre(dto.getGenre());

        user.setTelephone(dto.getTelephone());

        user.setAdresse(dto.getAdresse());

        user.setVille(dto.getVille());

        user.setPays(dto.getPays());

        user.setImageUrl(dto.getImageUrl());

        user.setEntreprise(entreprise);

        user.setRoles(roles);

        // update password optionnel
        if (dto.getPassword() != null &&
                !dto.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            dto.getPassword()
                    )
            );
        }

        Utilisateur updated = userRepo.save(user);

        return mapToDTO(updated);
    }

    // ==================================================
    // DELETE USER
    // ==================================================

    public void delete(Long id) {

        Utilisateur user = userRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Utilisateur not found"
                        ));

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (user.getEntreprise() == null ||
                    !user.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Accès refusé");
            }
        }

        // vider relations many-to-many
        user.getRoles().clear();

        userRepo.delete(user);
    }

    // ==================================================
    // ENTITY -> DTO
    // ==================================================

    private UtilisateurResponseDTO mapToDTO(
            Utilisateur u
    ) {

        return UtilisateurResponseDTO.builder()

                .id(u.getId())

                .nom(u.getNom())

                .prenom(u.getPrenom())

                .email(u.getEmail())

                .cin(u.getCin())

                .telephone(u.getTelephone())

                .adresse(u.getAdresse())

                .ville(u.getVille())

                .pays(u.getPays())

                .imageUrl(u.getImageUrl())

                .entrepriseNom(
                        u.getEntreprise() != null
                                ? u.getEntreprise().getNom()
                                : null
                )

                .entrepriseId(
                        u.getEntreprise() != null
                                ? u.getEntreprise().getId()
                                : null
                )

                .roles(
                        u.getRoles()
                                .stream()
                                .map(Role::getNom)
                                .collect(Collectors.toSet())
                )

                .build();
    }
}