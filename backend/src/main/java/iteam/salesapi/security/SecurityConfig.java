package iteam.salesapi.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

  //**  @Bean
    /** public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {});
              .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        //   SUPER ADMIN


                        //   SUPER ADMIN
                        .requestMatchers("/api/entreprises/**")
                        .hasRole("SUPER_ADMIN")


                        //  ADMIN ENTREPRISE
                        .requestMatchers("/api/utilisateurs/**","/api/produits/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE")

                        //  MANAGER
                        .requestMatchers("/api/rapports/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER")

                        //   CAISSIER
                        .requestMatchers("/api/ventes/**")
                        .hasAnyRole("SUPER_ADMIN","CAISSIER", "MANAGER", "ADMIN_ENTREPRISE")

                        //   STOCK
                        .requestMatchers("/api/stock/**")
                        .hasAnyRole("SUPER_ADMIN","STOCK_MANAGER", "MANAGER", "ADMIN_ENTREPRISE")

                        //   COMPTABLE
                        .requestMatchers("/api/finance/**")
                        .hasAnyRole("SUPER_ADMIN","COMPTABLE", "ADMIN_ENTREPRISE")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }**/

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        .requestMatchers("/api/roles/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE")

                        .requestMatchers(HttpMethod.GET, "/api/entreprises/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE")

                        .requestMatchers("/api/entreprises/**")
                        .hasRole("SUPER_ADMIN")

                        .requestMatchers("/api/utilisateurs/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE")

                        .requestMatchers(HttpMethod.GET, "/api/produits/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER", "CAISSIER", "STOCK_MANAGER")

                        .requestMatchers("/api/produits/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE")

                        .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/taxes/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER", "CAISSIER", "STOCK_MANAGER", "COMPTABLE")

                        .requestMatchers("/api/categories/**", "/api/taxes/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER")

                        .requestMatchers("/api/points-vente/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER")

                        .requestMatchers("/api/stocks/**", "/api/stock-movements/**", "/api/movements/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER", "STOCK_MANAGER")

                        .requestMatchers("/api/ventes/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "MANAGER", "CAISSIER")

                        .requestMatchers("/api/paiements/**", "/api/finance/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN_ENTREPRISE", "COMPTABLE", "CAISSIER")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}
