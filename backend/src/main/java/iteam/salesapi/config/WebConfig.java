package iteam.salesapi.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        /*
         * Cette configuration permet de rendre accessibles
         * les fichiers uploadés (images utilisateurs, logos,
         * images produits, documents, etc.)
         * depuis le navigateur ou le frontend Angular.
         *
         * Exemple :
         * URL :
         * http://localhost:8000/uploads/users/photo.png
         *
         * Spring va automatiquement chercher le fichier dans :
         * uploads/users/photo.png
         *
         * Sans cette configuration, les fichiers présents
         * dans le dossier uploads ne seraient pas accessibles
         * publiquement via HTTP.
         */

        registry
                .addResourceHandler("/uploads/**")

                .addResourceLocations("file:uploads/");
    }
}