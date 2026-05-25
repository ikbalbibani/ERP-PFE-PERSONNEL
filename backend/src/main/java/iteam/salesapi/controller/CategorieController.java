package iteam.salesapi.controller;

import iteam.salesapi.entity.Categorie;
import iteam.salesapi.service.CategorieService;
import iteam.salesapi.util.TypeEntreprise;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {


    private final CategorieService serviceCategorie;

    public CategorieController(CategorieService service) {
        this.serviceCategorie = service;
    }

    //  CREATE
    @PostMapping
    public Categorie create(@RequestBody Categorie dto) {
        return serviceCategorie.create(dto);
    }

    //  GET ALL
    @GetMapping
    public List<Categorie> getAll() {
        return serviceCategorie.getAll();
    }

    //   GET BY TYPE (PHARMACIE / BOUTIQUE)
    @GetMapping("/type/{type}")
    public List<Categorie> getByType(@PathVariable TypeEntreprise type) {
        return serviceCategorie.getByType(type);
    }

    //   GET SOUS-CATEGORIES
    @GetMapping("/parent/{id}")
    public List<Categorie> getByParent(@PathVariable Long id) {
        return serviceCategorie.getByParent(id);
    }

    @PutMapping("/{id}")
    public Categorie update(@PathVariable Long id, @RequestBody Categorie dto) {
        return serviceCategorie.update(id, dto);
    }

    //  DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        serviceCategorie.delete(id);
    }
}
