package com.arqulat.loom_backend.security;

import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.concurrent.TimeUnit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

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
        
        // 1. Check Redis (fast path)
        try {
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey("blacklist:jti:" + jti))) {
                return true;
            }
        } catch (Exception e) {
            log.warn("Redis check failed for JWT blacklist, falling back to database: {}", e.getMessage());
        }
        
        // 2. Fallback to DB (slow path)
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM public.blacklisted_tokens WHERE jti = ?", 
                Integer.class, 
                jti
        );
        boolean isBlacklistedInDb = count != null && count > 0;
        
        if (isBlacklistedInDb) {
            // Backfill Redis
            Date expiration = extractExpiration(jwtToken);
            if (expiration != null) {
                long ttl = expiration.getTime() - System.currentTimeMillis();
                if (ttl > 0) {
                    try {
                        stringRedisTemplate.opsForValue().set("blacklist:jti:" + jti, "true", ttl, TimeUnit.MILLISECONDS);
                    } catch (Exception e) {
                        log.warn("Failed to backfill Redis for JWT blacklist: {}", e.getMessage());
                    }
                }
            }
            return true;
        }
        
        return false;
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token) && !isTokenBlacklisted(token);
        } catch (Exception e) {
            return false;
        }
    }
}
