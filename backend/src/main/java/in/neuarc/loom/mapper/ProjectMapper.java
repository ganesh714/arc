package in.neuarc.loom.mapper;

import in.neuarc.loom.dto.ProjectDTO;
import in.neuarc.loom.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProjectMapper {
    @org.mapstruct.Mapping(source = "user.id", target = "userId")
    ProjectDTO toDTO(Project project);
    
    @org.mapstruct.Mapping(source = "userId", target = "user.id")
    Project toEntity(ProjectDTO projectDTO);
}
