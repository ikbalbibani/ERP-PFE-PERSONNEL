package iteam.salesapi.service;

import iteam.salesapi.entity.Entreprise;
import iteam.salesapi.entity.PointDeVente;
import iteam.salesapi.entity.Produit;
import iteam.salesapi.entity.Stock;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.exception.UnauthorizedException;
import iteam.salesapi.repository.PointDeVenteRepository;
import iteam.salesapi.repository.ProduitRepository;
import iteam.salesapi.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockService {

    private final StockRepository repo;
    private final ProduitRepository produitRepo;
    private final PointDeVenteRepository pointRepo;
    private final CurrentUserService currentUserService;

    public StockService(StockRepository repo,
                        ProduitRepository produitRepo,
                        PointDeVenteRepository pointRepo,
                        CurrentUserService currentUserService) {
        this.repo = repo;
        this.produitRepo = produitRepo;
        this.pointRepo = pointRepo;
        this.currentUserService = currentUserService;
    }

    public List<Stock> getAll() {
        if (!currentUserService.isSuperAdmin()) {
            Entreprise entreprise = currentUserService.getCurrentEntreprise();
            if (entreprise == null || entreprise.getId() == null) {
                throw new ResourceNotFoundException("Entreprise utilisateur introuvable");
            }

            return repo.findByProduitCategorieEntrepriseId(entreprise.getId());
        }

        return repo.findAll();
    }

    public Stock getById(Long id) {
        Stock stock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        verifyAccess(stock.getProduit());
        return stock;
    }

    public Stock create(Stock s) {
        Produit produit = resolveProduit(s);
        PointDeVente pointDeVente = resolvePointDeVente(s);

        verifySameEntreprise(produit, pointDeVente);
        verifyAccess(produit);

        s.setProduit(produit);
        s.setPointDeVente(pointDeVente);
        return repo.save(s);
    }

    public Stock update(Long id, Stock s) {
        Stock exist = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        verifyAccess(exist.getProduit());

        if (s.getProduit() != null && s.getProduit().getId() != null) {
            Produit produit = resolveProduit(s);
            PointDeVente pointDeVente = s.getPointDeVente() != null && s.getPointDeVente().getId() != null
                    ? resolvePointDeVente(s)
                    : exist.getPointDeVente();

            verifySameEntreprise(produit, pointDeVente);
            verifyAccess(produit);
            exist.setProduit(produit);
        }

        if (s.getPointDeVente() != null && s.getPointDeVente().getId() != null) {
            PointDeVente pointDeVente = resolvePointDeVente(s);
            Produit produit = exist.getProduit();

            verifySameEntreprise(produit, pointDeVente);
            verifyAccess(produit);
            exist.setPointDeVente(pointDeVente);
        }

        exist.setQuantite(s.getQuantite());
        return repo.save(exist);
    }

    public void delete(Long id) {
        Stock stock = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        verifyAccess(stock.getProduit());
        repo.deleteById(id);
    }

    private Produit resolveProduit(Stock stock) {
        if (stock.getProduit() == null || stock.getProduit().getId() == null) {
            throw new ResourceNotFoundException("Produit obligatoire");
        }

        return produitRepo.findById(stock.getProduit().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit not found"));
    }

    private PointDeVente resolvePointDeVente(Stock stock) {
        if (stock.getPointDeVente() == null || stock.getPointDeVente().getId() == null) {
            throw new ResourceNotFoundException("Point de vente obligatoire");
        }

        return pointRepo.findById(stock.getPointDeVente().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Point de vente not found"));
    }

    private void verifySameEntreprise(Produit produit, PointDeVente pointDeVente) {
        Entreprise produitEntreprise = getProduitEntreprise(produit);
        Entreprise pointEntreprise = pointDeVente != null ? pointDeVente.getEntreprise() : null;

        if (produitEntreprise == null || pointEntreprise == null || !produitEntreprise.getId().equals(pointEntreprise.getId())) {
            throw new UnauthorizedException("Produit et point de vente doivent appartenir a la meme entreprise");
        }
    }

    private void verifyAccess(Produit produit) {
        if (currentUserService.isSuperAdmin()) {
            return;
        }

        Entreprise currentEntreprise = currentUserService.getCurrentEntreprise();
        Entreprise produitEntreprise = getProduitEntreprise(produit);

        if (currentEntreprise == null || produitEntreprise == null || !currentEntreprise.getId().equals(produitEntreprise.getId())) {
            throw new UnauthorizedException("Acces refuse");
        }
    }

    private Entreprise getProduitEntreprise(Produit produit) {
        if (produit == null || produit.getCategorie() == null) {
            return null;
        }

        return produit.getCategorie().getEntreprise();
    }
}
