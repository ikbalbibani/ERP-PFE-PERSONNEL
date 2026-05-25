package iteam.salesapi.config;

import iteam.salesapi.entity.Role;
import iteam.salesapi.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {


            createRoleIfNotExists(roleRepository, "SUPER_ADMIN");
            createRoleIfNotExists(roleRepository, "ADMIN_ENTREPRISE");
            createRoleIfNotExists(roleRepository, "MANAGER");
            createRoleIfNotExists(roleRepository, "CAISSIER");
            createRoleIfNotExists(roleRepository, "STOCK_MANAGER");
            createRoleIfNotExists(roleRepository, "COMPTABLE");


        };
    }

    private void createRoleIfNotExists(RoleRepository repo, String nom) {
        if (repo.findByNom(nom).isEmpty()) {
            Role role = new Role();
            role.setNom(nom);
            repo.save(role);
            System.out.println(" Role créé : " + nom);
        }
    }

    /*Spring démarre

        CommandLineRunner s’exécute

        il vérifie chaque rôle

        il crée seulement ceux qui n’existent pas*/


}