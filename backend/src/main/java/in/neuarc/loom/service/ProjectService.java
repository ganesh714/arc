package in.neuarc.loom.service;

import in.neuarc.loom.dto.ProjectDTO;
import in.neuarc.loom.entity.Project;
import in.neuarc.loom.mapper.ProjectMapper;
import in.neuarc.loom.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return projectMapper.toDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        Project project = projectMapper.toEntity(projectDTO);
        Project savedProject = projectRepository.save(project);
        return projectMapper.toDTO(savedProject);
    }

    @Transactional
    public ProjectDTO updateProject(UUID id, ProjectDTO projectDTO) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        
        existingProject.setName(projectDTO.getName());
        existingProject.setDescription(projectDTO.getDescription());
        existingProject.setDiagramData(projectDTO.getDiagramData());
        existingProject.setTargetFramework(projectDTO.getTargetFramework());

        Project updatedProject = projectRepository.save(existingProject);
        return projectMapper.toDTO(updatedProject);
    }

    @Transactional
    public void deleteProject(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }
}
