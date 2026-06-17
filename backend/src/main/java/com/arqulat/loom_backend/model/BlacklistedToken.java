package com.arqulat.loom_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
// Points specifically to the public schema where arqulat_auth writes to
@Table(name = "blacklisted_tokens", schema = "public")
public class BlacklistedToken {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String jti;

    @Column(name = "expires_at", nullable = false)
    private Date expiresAt;
}
