package iteam.salesapi.service;

import iteam.salesapi.dto.ProduitRequestDTO;
import iteam.salesapi.dto.ProduitResponseDTO;
import iteam.salesapi.entity.Categorie;
import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.PointDeVente;
import iteam.salesapi.entity.Produit;
import iteam.salesapi.entity.Stock;
import iteam.salesapi.entity.Taxe;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.CategorieRepository;
import iteam.salesapi.repository.EntrepriseRepository;
import iteam.salesapi.repository.PointDeVenteRepository;
import iteam.salesapi.repository.ProduitRepository;
import iteam.salesapi.repository.StockRepository;
import iteam.salesapi.repository.TaxeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    private final ProduitRepository produitRepo;
    private final EntrepriseRepository entrepriseRepo;
    private final CategorieRepository categorieRepo;
    private final TaxeRepository taxeRepository;
    private final StockRepository stockRepo;
    private final PointDeVenteRepository pointRepo;
    private final CurrentUserService currentUserService;

    public ProduitService(ProduitRepository produitRepo,
                          EntrepriseRepository entrepriseRepo,
                          CategorieRepository categorieRepo,
                          TaxeRepository taxeRepository,
                          StockRepository stockRepo,
                          PointDeVenteRepository pointRepo,
                          CurrentUserService currentUserService) {
        this.produitRepo = produitRepo;
        this.entrepriseRepo = entrepriseRepo;
        this.categorieRepo = categorieRepo;
        this.taxeRepository = taxeRepository;
        this.stockRepo = stockRepo;
        this.pointRepo = pointRepo;
        this.currentUserService = currentUserService;
    }

    public ProduitResponseDTO create(ProduitRequestDTO dto) {
        Entreprise entreprise = resolveEntreprise(dto.getEntrepriseId());
        Categorie categorie = resolveCategorie(dto.getCategorieId(), entreprise);
        Taxe taxe = resolveTaxe(dto.getTaxeId(), entreprise);

        Produit produit = new Produit();
        produit.setNom(dto.getNom());
        produit.setCode(dto.getCode());
        produit.setPrix(dto.getPrix());
        produit.setBarcode(dto.getBarcode());
        produit.setImageUrl(dto.getImageUrl());
        produit.setStockMinimum(dto.getStockMinimum());
        produit.setActif(dto.getActif());
        produit.setCategorie(categorie);
        produit.setTaxe(taxe);

        Produit saved = produitRepo.save(produit);

        List<PointDeVente> points = pointRepo.findByEntrepriseId(entreprise.getId());
        for (PointDeVente pdv : points) {
            Stock stock = new Stock();
            stock.setProduit(saved);
            stock.setPointDeVente(pdv);
            stock.setQuantite(0);
            stockRepo.save(stock);
        }

        return mapToDTO(saved);
    }

    public List<ProduitResponseDTO> getByEntreprise(Long entrepriseId) {
        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (!entreprise.getId().equals(entrepriseId)) {
                throw new UnauthorizedException("Acces refuse");
            }
        }

        return produitRepo.findByCategorieEntrepriseId(entrepriseId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ProduitResponseDTO> getAllVisible() {
        if (currentUserService.isSuperAdmin()) {
            return produitRepo.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .toList();
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        if (entreprise == null || entreprise.getId() == null) {
            throw new ResourceNotFoundException("Entreprise utilisateur introuvable");
        }

        return produitRepo.findByCategorieEntrepriseId(entreprise.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ProduitResponseDTO getById(Long id) {
        Produit produit = produitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit not found"));

        verifyProduitEntrepriseAccess(produit);

        return mapToDTO(produit);
    }

    public ProduitResponseDTO update(Long id, ProduitRequestDTO dto) {
        Produit produit = produitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit not found"));

        verifyProduitEntrepriseAccess(produit);

        Entreprise entreprise = resolveEntreprise(dto.getEntrepriseId());
        Categorie categorie = resolveCategorie(dto.getCategorieId(), entreprise);
        Taxe taxe = resolveTaxe(dto.getTaxeId(), entreprise);

        produit.setNom(dto.getNom());
        produit.setCode(dto.getCode());
        produit.setPrix(dto.getPrix());
        produit.setBarcode(dto.getBarcode());
        produit.setImageUrl(dto.getImageUrl());
        produit.setStockMinimum(dto.getStockMinimum());
        produit.setActif(dto.getActif());
        produit.setCategorie(categorie);
        produit.setTaxe(taxe);

        return mapToDTO(produitRepo.save(produit));
    }

    public void delete(Long id) {
        Produit produit = produitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit not found"));

        verifyProduitEntrepriseAccess(produit);
        produitRepo.delete(produit);
    }

    private Entreprise resolveEntreprise(Long requestedEntrepriseId) {
        if (currentUserService.isSuperAdmin()) {
            if (requestedEntrepriseId == null) {
                throw new ResourceNotFoundException("Entreprise obligatoire");
            }

            return entrepriseRepo.findById(requestedEntrepriseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Entreprise not found"));
        }

        Entreprise currentEntreprise = currentUserService.getCurrentEntreprise();
        if (requestedEntrepriseId != null && !requestedEntrepriseId.equals(currentEntreprise.getId())) {
            throw new UnauthorizedException("Acces refuse");
        }

        return currentEntreprise;
    }

    private Categorie resolveCategorie(Long categorieId, Entreprise entreprise) {
        if (categorieId == null) {
            throw new ResourceNotFoundException("Categorie obligatoire");
        }

        Categorie categorie = categorieRepo.findById(categorieId)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie not found"));

        if (categorie.getEntreprise() == null || !categorie.getEntreprise().getId().equals(entreprise.getId())) {
            throw new UnauthorizedException("Categorie invalide pour cette entreprise");
        }

        return categorie;
    }

    private Taxe resolveTaxe(Long taxeId, Entreprise entreprise) {
        if (taxeId == null) {
            return null;
        }

        Taxe taxe = taxeRepository.findById(taxeId)
                .orElseThrow(() -> new ResourceNotFoundException("Taxe not found"));

        if (taxe.getEntreprise() == null || !taxe.getEntreprise().getId().equals(entreprise.getId())) {
            throw new UnauthorizedException("Taxe invalide pour cette entreprise");
        }

        return taxe;
    }

    private void verifyProduitEntrepriseAccess(Produit produit) {
        if (currentUserService.isSuperAdmin()) {
            return;
        }

        Entreprise entreprise = currentUserService.getCurrentEntreprise();
        Entreprise produitEntreprise = getProduitEntreprise(produit);
        if (produitEntreprise == null || !produitEntreprise.getId().equals(entreprise.getId())) {
            throw new UnauthorizedException("Acces refuse");
        }
    }

    private Entreprise getProduitEntreprise(Produit produit) {
        if (produit.getCategorie() == null || produit.getCategorie().getEntreprise() == null) {
            return null;
        }

        return produit.getCategorie().getEntreprise();
    }

    private ProduitResponseDTO mapToDTO(Produit p) {
        Entreprise entreprise = getProduitEntreprise(p);

        return ProduitResponseDTO.builder()
                .id(p.getId())
                .nom(p.getNom())
                .code(p.getCode())
                .prix(p.getPrix())
                .barcode(p.getBarcode())
                .imageUrl(p.getImageUrl())
                .stockMinimum(p.getStockMinimum())
                .actif(p.getActif())
                .entrepriseId(entreprise != null ? entreprise.getId() : null)
                .entrepriseNom(entreprise != null ? entreprise.getNom() : null)
                .categorieId(p.getCategorie() != null ? p.getCategorie().getId() : null)
                .categorieNom(p.getCategorie() != null ? p.getCategorie().getNom() : null)
                .taxeId(p.getTaxe() != null ? p.getTaxe().getId() : null)
                .taxeNom(p.getTaxe() != null ? p.getTaxe().getNom() : null)
                .taxeTaux(p.getTaxe() != null ? p.getTaxe().getTaux() : 0)
                .build();
    }
}
