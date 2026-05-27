package in.neuarc.loom.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProjectDTO {
    private UUID id;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    
    private String diagramData;

    @NotBlank(message = "Target framework is required")
    private String targetFramework;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
