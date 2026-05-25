package iteam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class SalesBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalesBackendApplication.class, args);
        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String passwordCrypte =
                encoder.encode("1234");

        System.out.println("helloooooooooooooooo"+passwordCrypte);
    }

}
