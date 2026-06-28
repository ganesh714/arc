package com.arqulat.loom_backend.config;

import java.util.Collections;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.arqulat.loom_backend.security.JwtService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class StompChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String jwtToken = extractJwtFromAccessor(accessor);
            if (jwtToken != null && jwtService.isTokenValid(jwtToken)) {
                UUID userId = jwtService.extractUserId(jwtToken);
                log.debug("WebSocket CONNECT authenticated for user: {}", userId);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.emptyList());
                accessor.setUser(auth);
            } else {
                log.warn("WebSocket CONNECT rejected: Invalid or missing JWT");
                throw new IllegalArgumentException("Invalid JWT"); // Prevents the connection
            }
        }

        return message;
    }

    private String extractJwtFromAccessor(StompHeaderAccessor accessor) {
        // Option 1: Extract JWT from WebSocket session attributes (populated by HandshakeInterceptor)
        java.util.Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("jwt")) {
            return (String) sessionAttributes.get("jwt");
        }

        // Option 2: Custom passed header (e.g., frontend passes it explicitly in STOMP headers)
        java.util.List<String> tokenHeader = accessor.getNativeHeader("Authorization");
        if (tokenHeader != null && !tokenHeader.isEmpty()) {
            String bearer = tokenHeader.get(0);
            if (bearer.startsWith("Bearer ")) {
                return bearer.substring(7);
            }
        }

        return null;
    }
}
