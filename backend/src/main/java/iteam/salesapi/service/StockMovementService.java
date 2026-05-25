package iteam.salesapi.service;

import iteam.salesapi.entity.Stock;
import iteam.salesapi.entity.StockMovement;
import iteam.salesapi.exception.ResourceNotFoundException;
import iteam.salesapi.repository.StockMovementRepository;
import iteam.salesapi.repository.StockRepository;
import iteam.salesapi.util.StockMovementType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository repo;
    private final StockRepository stockRepo;

    public StockMovementService(StockMovementRepository repo, StockRepository stockRepo) {
        this.repo = repo;
        this.stockRepo = stockRepo;
    }

    public List<StockMovement> getAll() {
        return repo.findAll();
    }

    public List<StockMovement> getByStock(Long stockId) {
        return repo.findByStockId(stockId);
    }

    public StockMovement create(StockMovement movement) {
        if (movement.getStock() == null || movement.getStock().getId() == null) {
            throw new ResourceNotFoundException("Stock obligatoire pour un mouvement");
        }

        Stock stock = stockRepo.findById(movement.getStock().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        movement.setStock(stock);
        applyMovement(stock, movement);
        stockRepo.save(stock);

        return repo.save(movement);
    }

    private void applyMovement(Stock stock, StockMovement movement) {
        StockMovementType type = movement.getType();
        int quantite = movement.getQuantite();
        int nouvelleQuantite;

        if (type == null) {
            throw new ResourceNotFoundException("Type mouvement obligatoire");
        }

        if (quantite < 0) {
            throw new ResourceNotFoundException("Quantite mouvement invalide");
        }

        switch (type) {
            case ENTREE -> stock.setQuantite(stock.getQuantite() + quantite);
            case SORTIE -> {
                nouvelleQuantite = stock.getQuantite() - quantite;
                if (nouvelleQuantite < 0) {
                    throw new ResourceNotFoundException("Stock insuffisant");
                }
                stock.setQuantite(nouvelleQuantite);
            }
            case AJUSTEMENT -> stock.setQuantite(quantite);
            case TRANSFERT -> {
                // Un transfert complet devra creer un second mouvement ENTREE sur le stock destination.
                nouvelleQuantite = stock.getQuantite() - quantite;
                if (nouvelleQuantite < 0) {
                    throw new ResourceNotFoundException("Stock insuffisant");
                }
                stock.setQuantite(nouvelleQuantite);
            }
        }
    }
}
