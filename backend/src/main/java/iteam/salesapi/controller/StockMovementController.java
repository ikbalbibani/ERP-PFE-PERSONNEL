package iteam.salesapi.controller;

import iteam.salesapi.entity.StockMovement;
import iteam.salesapi.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/stock-movements", "/api/movements"})
public class StockMovementController {

    @Autowired
    private StockMovementService service;

    @GetMapping
    public List<StockMovement> getAll() {
        return service.getAll();
    }

    @PostMapping
    public StockMovement create(@RequestBody StockMovement m) {
        return service.create(m);
    }

    @GetMapping("/stock/{stockId}")
    public List<StockMovement> getByStock(@PathVariable Long stockId) {
        return service.getByStock(stockId);
    }
}
