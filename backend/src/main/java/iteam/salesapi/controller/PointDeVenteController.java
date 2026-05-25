package iteam.salesapi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import iteam.salesapi.dto.PointDeVenteRequestDTO;
import iteam.salesapi.dto.PointDeVenteResponseDTO;
import iteam.salesapi.service.PointDeVenteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/points-vente")
@Tag(name = "Point de Vente", description = "Gestion des points de vente")
public class PointDeVenteController {

    private final PointDeVenteService service;

    public PointDeVenteController(PointDeVenteService service) {
        this.service = service;
    }

    @Operation(summary = "Créer un point de vente")
    @PostMapping
    public PointDeVenteResponseDTO create(@RequestBody PointDeVenteRequestDTO dto) {
        return service.create(dto);
    }

    @Operation(summary = "Liste de tous les points de vente")
    @GetMapping
    public List<PointDeVenteResponseDTO> getAll() {
        return service.getAll();
    }

    @Operation(summary = "Points de vente par entreprise")
    @GetMapping("/entreprise/{id}")
    public List<PointDeVenteResponseDTO> getByEntreprise(@PathVariable Long id) {
        return service.getByEntreprise(id);
    }

    @Operation(summary = "Modifier un point de vente")
    @PutMapping("/{id}")
    public PointDeVenteResponseDTO update(@PathVariable Long id,
                                          @RequestBody PointDeVenteRequestDTO dto) {
        return service.update(id, dto);
    }

    @Operation(summary = "Supprimer un point de vente")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
