package iteam.salesapi.service;

import iteam.salesapi.entity.Categorie;
import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.CategorieRepository;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.util.TypeEntreprise;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService {

    private final CategorieRepository categorieRepo;
    private final EntrepriseRepository entrepriseRepo;
    private final CurrentUserService currentUserService;

    public CategorieService(CategorieRepository categorieRepo,
                            EntrepriseRepository entrepriseRepo,
                            CurrentUserService currentUserService) {
        this.categorieRepo = categorieRepo;
        this.entrepriseRepo = entrepriseRepo;
        this.currentUserService = currentUserService;
    }

    public Categorie create(Categorie dto) {
        if (dto.getNom() == null || dto.getNom().isBlank()) {
            throw new ResourceNotFoundException("Nom categorie obligatoire");
        }

        Entreprise entreprise = resolveEntreprise(dto);

        Categorie categorie = new Categorie();
        categorie.setNom(dto.getNom());
        categorie.setEntreprise(entreprise);

        if (dto.getParent() != null && dto.getParent().getId() != null) {
            Categorie parent = categorieRepo.findById(dto.getParent().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent categorie not found"));

            if (parent.getEntreprise() == null || !parent.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Acces refuse");
            }

            categorie.setParent(parent);
        }

        return categorieRepo.save(categorie);
    }

    public List<Categorie> getAll() {
        if (currentUserService.isSuperAdmin()) {
            return categorieRepo.findAll();
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        return categorieRepo.findByEntrepriseId(entreprise.getId());
    }

    public List<Categorie> getByType(TypeEntreprise type) {
        if (currentUserService.isSuperAdmin()) {
            return categorieRepo.findByEntreprise_TypeEntreprise(type);
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        return categorieRepo.findByEntreprise_TypeEntrepriseAndEntrepriseId(type, entreprise.getId());
    }

    public List<Categorie> getByParent(Long parentId) {
        if (currentUserService.isSuperAdmin()) {
            return categorieRepo.findAll()
                    .stream()
                    .filter(cat -> cat.getParent() != null && cat.getParent().getId().equals(parentId))
                    .toList();
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        return categorieRepo.findByParentIdAndEntrepriseId(parentId, entreprise.getId());
    }

    public Categorie update(Long id, Categorie dto) {
        Categorie categorie = categorieRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie not found"));

        Entreprise entreprise = resolveEntreprise(dto);
        if (categorie.getEntreprise() == null || !categorie.getEntreprise().getId().equals(entreprise.getId())) {
            throw new UnauthorizedException("Acces refuse");
        }

        if (dto.getNom() == null || dto.getNom().isBlank()) {
            throw new ResourceNotFoundException("Nom categorie obligatoire");
        }

        categorie.setNom(dto.getNom());

        if (dto.getParent() != null && dto.getParent().getId() != null) {
            if (dto.getParent().getId().equals(id)) {
                throw new ResourceNotFoundException("Une categorie ne peut pas etre son propre parent");
            }

            Categorie parent = categorieRepo.findById(dto.getParent().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent categorie not found"));

            if (parent.getEntreprise() == null || !parent.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Acces refuse");
            }

            categorie.setParent(parent);
        } else {
            categorie.setParent(null);
        }

        return categorieRepo.save(categorie);
    }

    public void delete(Long id) {
        Categorie cat = categorieRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie not found"));

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (cat.getEntreprise() == null || !cat.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Acces refuse");
            }
        }

        categorieRepo.delete(cat);
    }

    private Entreprise resolveEntreprise(Categorie dto) {
        if (!currentUserService.isSuperAdmin()) {
            return currentUserService.getCurrentEntreprise();
        }

        if (dto.getEntreprise() == null || dto.getEntreprise().getId() == null) {
            throw new ResourceNotFoundException("Entreprise obligatoire");
        }

        return entrepriseRepo.findById(dto.getEntreprise().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise not found"));
    }
}
