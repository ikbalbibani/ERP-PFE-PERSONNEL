package iteam.salesapi.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Getter
@Builder
public class UtilisateurResponseDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String cin;
    private String telephone;
    private String adresse;
    private String ville;
    private String pays;
    private String imageUrl;
    private String entrepriseNom;
    private Set<String> roles;

    private Integer age;
    private String genre;


    private Long entrepriseId;
    private Set<Long> roleIds;
}