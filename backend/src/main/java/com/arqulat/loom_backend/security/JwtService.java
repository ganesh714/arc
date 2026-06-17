package com.arqulat.loom_backend.security;

import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.jdbc.core.JdbcTemplate;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private SecretKey getSignKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public <T> T extractClaims(String jwtToken, Function<Claims, T> typeOfClaim) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(jwtToken)
                .getPayload();
        
        return typeOfClaim.apply(claims);
    }

    public String extractUserName(String jwtToken) {
        return extractClaims(jwtToken, Claims::getSubject);
    }

    public java.util.UUID extractUserId(String jwtToken) {
        String uidStr = extractClaims(jwtToken, claims -> claims.get("uid", String.class));
        return uidStr != null ? java.util.UUID.fromString(uidStr) : null;
    }

    public String extractJti(String jwtToken) {
        return extractClaims(jwtToken, Claims::getId);
    }

    public Date extractExpiration(String jwtToken) {
        return extractClaims(jwtToken, Claims::getExpiration);
    }

    public boolean isTokenExpired(String jwtToken) {
        Date expireDate = extractExpiration(jwtToken);
        return expireDate.before(new Date());
    }

    public boolean isTokenBlacklisted(String jwtToken) {
        String jti = extractJti(jwtToken);
        if (jti == null) return false;
        
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM public.blacklisted_tokens WHERE jti = ?", 
                Integer.class, 
                jti
        );
        return count != null && count > 0;
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token) && !isTokenBlacklisted(token);
        } catch (Exception e) {
            return false;
        }
    }
}
