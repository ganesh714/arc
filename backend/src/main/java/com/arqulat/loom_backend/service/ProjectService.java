package com.arqulat.loom_backend.service;

import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arqulat.loom_backend.dto.ProjectRequests.CreateProjectRequest;
import com.arqulat.loom_backend.dto.ProjectRequests.UpdateProjectRequest;
import com.arqulat.loom_backend.dto.Responses.ProjectSummaryDTO;
import com.arqulat.loom_backend.model.DiagramFile;
import com.arqulat.loom_backend.model.Project;
import com.arqulat.loom_backend.repository.ProjectRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ProjectSummaryDTO> getUserProjects(UUID userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return projects.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Transactional
    public ProjectSummaryDTO createProject(UUID userId, CreateProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .category(request.getCategory() != null ? request.getCategory() : "Loom Diagrams")
                .userId(userId)
                .build();

        DiagramFile initialFile = DiagramFile.builder()
                .name("Untitled")
                .canvasBgColor(request.getBackgroundColor() != null ? request.getBackgroundColor() : "#0f0f0f")
                .project(project)
                .nodes(objectMapper.createArrayNode())
                .build();

        project.getFiles().add(initialFile);

        Project saved = projectRepository.save(project);
        return mapToSummary(saved);
    }

    @Transactional
    public ProjectSummaryDTO updateProject(UUID projectId, UUID userId, UpdateProjectRequest request) {
        Project project = getProjectIfOwned(projectId, userId);
        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getCategory() != null) {
            project.setCategory(request.getCategory());
        }
        Project updated = projectRepository.save(project);
        return mapToSummary(updated);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        Project project = getProjectIfOwned(projectId, userId);
        projectRepository.delete(project);
    }

    public Project getProjectIfOwned(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new com.arqulat.loom_backend.exception.ResourceNotFoundException("Project not found"));
        if (!project.getUserId().equals(userId)) {
            throw new com.arqulat.loom_backend.exception.UnauthorizedAccessException("Unauthorized to access this project");
        }
        return project;
    }

    private ProjectSummaryDTO mapToSummary(Project project) {
        return ProjectSummaryDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .fileCount(project.getFiles().size())
                .updatedAt(project.getUpdatedAt() != null ? project.getUpdatedAt().toInstant(ZoneOffset.UTC).toEpochMilli() : System.currentTimeMillis())
                .build();
    }
}
