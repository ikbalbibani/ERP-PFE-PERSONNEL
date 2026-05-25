package iteam.salesapi.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UtilisateurRequestDTO {

    private String nom;
    private String prenom;
    private String email;
    private String password;

    private String cin;
    private Integer age;
    private String genre;

    private String telephone;
    private String adresse;
    private String ville;
    private String pays;

    private String imageUrl;

    private Long entrepriseId;
    private Set<Long> roleIds;
}