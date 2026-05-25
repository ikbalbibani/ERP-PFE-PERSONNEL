package iteam.salesapi.controller;


import iteam.salesapi.entity.Role;
import iteam.salesapi.repository.RoleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleRepository repo;

    public RoleController(RoleRepository repo) {
        this.repo = repo;
    }

    // uniquement GET (suffisant)
    @GetMapping
    public List<Role> getAll() {
        return repo.findAll();
    }

}