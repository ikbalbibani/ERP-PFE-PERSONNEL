package iteam.salesapi.controller;

import iteam.salesapi.entity.Taxe;
import iteam.salesapi.service.TaxeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
public class TaxeController {

    @Autowired
    private TaxeService service;

    @GetMapping
    public List<Taxe> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Taxe getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Taxe create(@RequestBody Taxe t) {
        return service.create(t);
    }

    @PutMapping("/{id}")
    public Taxe update(@PathVariable Long id, @RequestBody Taxe t) {
        return service.update(id, t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
