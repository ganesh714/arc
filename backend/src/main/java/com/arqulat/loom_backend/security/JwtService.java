package com.arqulat.loom_backend.security;

import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.arqulat.loom_backend.repository.BlacklistedTokenRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

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
        return blacklistedTokenRepository.existsByJti(jti);
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token) && !isTokenBlacklisted(token);
        } catch (Exception e) {
            return false;
        }
    }
}
