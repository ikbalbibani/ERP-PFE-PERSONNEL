package iteam.salesapi.repository;

import iteam.salesapi.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    //pour verifier si le rôle existe déjà → ne pas recréer
    Optional<Role> findByNom(String nom);
}
