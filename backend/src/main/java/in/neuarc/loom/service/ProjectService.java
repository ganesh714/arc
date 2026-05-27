package in.neuarc.loom.service;

import in.neuarc.loom.dto.ProjectDTO;
import in.neuarc.loom.entity.Project;
import in.neuarc.loom.entity.User;
import in.neuarc.loom.mapper.ProjectMapper;
import in.neuarc.loom.repository.ProjectRepository;
import in.neuarc.loom.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByUserId(UUID userId) {
        // In a real scenario, we'd use a custom repository method: projectRepository.findByUserId(userId)
        // For now, filtering the list to demonstrate logic
        return projectRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .map(projectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        Project project = projectMapper.toEntity(projectDTO);
        
        User user = userRepository.findById(projectDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        project.setUser(user);

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
