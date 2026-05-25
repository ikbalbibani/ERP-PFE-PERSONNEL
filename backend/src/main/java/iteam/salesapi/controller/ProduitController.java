package iteam.salesapi.controller;


import iteam.salesapi.dto.ProduitRequestDTO;
import iteam.salesapi.dto.ProduitResponseDTO;
import iteam.salesapi.service.ProduitService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService service;

    public ProduitController(ProduitService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProduitResponseDTO> getAllVisible() {
        return service.getAllVisible();
    }

    //  CREATE
    @PostMapping
    public ProduitResponseDTO create(@RequestBody ProduitRequestDTO dto) {
        return service.create(dto);
    }

    // GET ALL BY ENTREPRISE
    @GetMapping("/entreprise/{id}")
    public List<ProduitResponseDTO> getByEntreprise(@PathVariable Long id) {
        return service.getByEntreprise(id);
    }

    //  GET BY ID
    @GetMapping("/{id}")
    public ProduitResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    //  UPDATE
    @PutMapping("/{id}")
    public ProduitResponseDTO update(@PathVariable Long id,
                                     @RequestBody ProduitRequestDTO dto) {
        return service.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
