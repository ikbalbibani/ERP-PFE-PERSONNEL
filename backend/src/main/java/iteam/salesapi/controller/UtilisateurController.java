package iteam.salesapi.controller;

import iteam.salesapi.dto.UtilisateurRequestDTO;
import iteam.salesapi.dto.UtilisateurResponseDTO;
import iteam.salesapi.service.UtilisateurService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService service;

    public UtilisateurController(UtilisateurService service) {
        this.service = service;
    }

    //  CREATE
    @PostMapping
    public UtilisateurResponseDTO create(@RequestBody UtilisateurRequestDTO dto) {
        return service.create(dto);
    }

    //  GET ALL
    @GetMapping
    public List<UtilisateurResponseDTO> getAll() {
        return service.getAll();
    }

    //  GET BY ID
    @GetMapping("/{id}")
    public UtilisateurResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    //  UPDATE
    @PutMapping("/{id}")
    public UtilisateurResponseDTO update(@PathVariable Long id,
                                         @RequestBody UtilisateurRequestDTO dto) {
        return service.update(id, dto);
    }

    //  DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}