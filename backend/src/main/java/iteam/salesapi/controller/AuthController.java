package iteam.salesapi.controller;

import iteam.salesapi.dto.LoginRequestDTO;
import iteam.salesapi.dto.LoginResponseDTO;
import iteam.salesapi.service.UtilisateurService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UtilisateurService service;

    public AuthController(UtilisateurService service) {
        this.service = service;
    }

    //  endpoint login
    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) {

        //   envoyer les données au service
        return service.login(dto);
    }
}