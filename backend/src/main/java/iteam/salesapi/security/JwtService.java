package iteam.salesapi.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final String SECRET = "mysecretkeymysecretkeymysecretkey";

    public String generateToken(String email, List<String> roles) {
         /*
     transforme secret string en clé sécurisée
     */
        Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
        System.out.println("les roles sontttttttttttttt"+roles);
        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles) //  liste des rôles
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

    }
    /*
       extraction email depuis token
       */
    public String extractEmail(String token) {
        Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public List<String> extractRoles(String token) {
        Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

        Object roles = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)


                .getBody()
                .get("roles");

        if (roles instanceof List<?>) {
            System.out.println("les roles sontttttttttttttttt"+roles);
            return ((List<?>) roles)
                    .stream()
                    .map(Object::toString)
                    .toList();
        }

        return null;
    }
}