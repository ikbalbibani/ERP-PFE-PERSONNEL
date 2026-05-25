package iteam.salesapi.security;

import iteam.salesapi.entity.Utilisateur;
import iteam.salesapi.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Service
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7).trim();
            System.out.println("tokennnnnnnnnnnnnnnnnnnn = " + token);

            try {

                String email = jwtService.extractEmail(token);
                List<String> roles = jwtService.extractRoles(token);

                System.out.println("dddddddddddddddddddddddddddddddddd= " + email);
                System.out.println("EMAIL = " + email);
                System.out.println("ROLES = " + roles);

                if (roles == null || roles.isEmpty()) {
                    System.out.println(" roles vide !");
                    filterChain.doFilter(request, response);
                    return;
                }

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .toList();

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );
                System.out.println("EMAIL = " + email);
                System.out.println("ROLES = " + roles);
                System.out.println("AUTHORITIES = " + authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                System.out.println(" Token invalide: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}