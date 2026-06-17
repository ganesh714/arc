package com.arqulat.loom_backend.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String jwtToken = null;
        String userEmail = null;

        if (request.getCookies() != null) {
            Optional<Cookie> authCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> "arqulat_session".equals(cookie.getName()))
                    .findFirst();

            if (authCookie.isPresent()) {
                jwtToken = authCookie.get().getValue();
                try {
                    if (jwtService.isTokenValid(jwtToken)) {
                        userEmail = jwtService.extractUserName(jwtToken);
                        log.debug("Valid JWT found for user: {}", userEmail);
                    } else {
                        log.warn("JWT is invalid or blacklisted");
                    }
                } catch (Exception e) {
                    log.warn("Failed to process JWT: {}", e.getMessage());
                }
            }
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // We just set the principal as the userEmail string. No authorities needed.
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    userEmail, null, java.util.Collections.emptyList());
            token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(token);
        }

        filterChain.doFilter(request, response);
    }
}
