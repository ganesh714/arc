package com.arqulat.loom_backend.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.arqulat.loom_backend.model.DiagramFileVersion;

@Repository
public interface DiagramFileVersionRepository extends JpaRepository<DiagramFileVersion, UUID> {
    List<DiagramFileVersion> findByDiagramFileIdOrderByCreatedAtDesc(UUID diagramFileId);
}
