package in.neuarc.loom.repository;

import in.neuarc.loom.entity.ConversionJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversionJobRepository extends JpaRepository<ConversionJob, UUID> {
    List<ConversionJob> findByProjectId(UUID projectId);
}
