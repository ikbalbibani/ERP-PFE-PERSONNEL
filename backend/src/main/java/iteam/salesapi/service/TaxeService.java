package iteam.salesapi.service;

import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.Taxe;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.repository.TaxeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxeService {

    private final TaxeRepository repo;
    private final EntrepriseRepository entrepriseRepo;
    private final CurrentUserService currentUserService;

    public TaxeService(TaxeRepository repo,
                       EntrepriseRepository entrepriseRepo,
                       CurrentUserService currentUserService) {
        this.repo = repo;
        this.entrepriseRepo = entrepriseRepo;
        this.currentUserService = currentUserService;
    }

    public List<Taxe> getAll() {
        if (currentUserService.isSuperAdmin()) {
            return repo.findAll();
        }

        Entreprise entreprise = getCurrentEntrepriseOrThrow();
        return repo.findByEntrepriseId(entreprise.getId());
    }

    public Taxe getById(Long id) {
        if (currentUserService.isSuperAdmin()) {
            return repo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Taxe not found"));
        }

        Entreprise entreprise = getCurrentEntrepriseOrThrow();
        return repo.findByIdAndEntrepriseId(id, entreprise.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Taxe not found"));
    }

    public Taxe create(Taxe taxe) {
        validateTaxe(taxe);
        taxe.setEntreprise(resolveEntrepriseForRequest(taxe));

        return repo.save(taxe);
    }

    public Taxe update(Long id, Taxe taxe) {
        Taxe exist = getById(id);
        validateTaxe(taxe);

        Entreprise entreprise = resolveEntrepriseForRequest(taxe);
        if (!currentUserService.isSuperAdmin() &&
                (exist.getEntreprise() == null || !exist.getEntreprise().getId().equals(entreprise.getId()))) {
            throw new UnauthorizedException("Acces refuse");
        }

        exist.setNom(taxe.getNom());
        exist.setTaux(taxe.getTaux());
        exist.setActif(taxe.isActif());
        exist.setEntreprise(entreprise);

        return repo.save(exist);
    }

    public void delete(Long id) {
        Taxe taxe = getById(id);

        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = getCurrentEntrepriseOrThrow();
            if (taxe.getEntreprise() == null || !taxe.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Acces refuse");
            }
        }

        repo.delete(taxe);
    }

    private Entreprise resolveEntrepriseForRequest(Taxe taxe) {
        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = getCurrentEntrepriseOrThrow();
            if (taxe.getEntreprise() != null &&
                    taxe.getEntreprise().getId() != null &&
                    !taxe.getEntreprise().getId().equals(entreprise.getId())) {
                throw new UnauthorizedException("Acces refuse");
            }

            return entreprise;
        }

        if (taxe.getEntreprise() == null || taxe.getEntreprise().getId() == null) {
            throw new RuntimeException("Entreprise obligatoire");
        }

        return entrepriseRepo.findById(taxe.getEntreprise().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise not found"));
    }

    private Entreprise getCurrentEntrepriseOrThrow() {
        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        if (entreprise == null || entreprise.getId() == null) {
            throw new ResourceNotFoundException("Entreprise utilisateur introuvable");
        }

        return entreprise;
    }

    private void validateTaxe(Taxe taxe) {
        if (taxe.getNom() == null || taxe.getNom().isBlank()) {
            throw new RuntimeException("Nom taxe obligatoire");
        }

        if (taxe.getTaux() < 0) {
            throw new RuntimeException("Taux taxe invalide");
        }
    }
}
