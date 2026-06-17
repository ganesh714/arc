package com.arqulat.loom_backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.arqulat.loom_backend.dto.ProjectRequests.CreateProjectRequest;
import com.arqulat.loom_backend.dto.ProjectRequests.UpdateProjectRequest;
import com.arqulat.loom_backend.dto.Responses.ProjectSummaryDTO;
import com.arqulat.loom_backend.service.ProjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<ProjectSummaryDTO> getProjects(Authentication authentication) {
        return projectService.getUserProjects((UUID) authentication.getPrincipal());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectSummaryDTO createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        return projectService.createProject((UUID) authentication.getPrincipal(), request);
    }

    @PutMapping("/{id}")
    public ProjectSummaryDTO updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication) {
        return projectService.updateProject(id, (UUID) authentication.getPrincipal(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable UUID id, Authentication authentication) {
        projectService.deleteProject(id, (UUID) authentication.getPrincipal());
    }
}
