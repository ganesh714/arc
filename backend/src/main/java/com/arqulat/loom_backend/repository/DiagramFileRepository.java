package com.arqulat.loom_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.arqulat.loom_backend.model.DiagramFile;

@Repository
public interface DiagramFileRepository extends JpaRepository<DiagramFile, UUID> {
    List<DiagramFile> findByProjectIdOrderByUpdatedAtDesc(UUID projectId);
    
    boolean existsByProjectIdAndName(UUID projectId, String name);
    
    boolean existsByIdAndProjectUserId(UUID id, UUID userId);
}
