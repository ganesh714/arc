package com.arqulat.loom_backend.service;

import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arqulat.loom_backend.dto.FileRequests.CreateFileRequest;
import com.arqulat.loom_backend.dto.FileRequests.UpdateFileRequest;
import com.arqulat.loom_backend.dto.Responses.FileDetailDTO;
import com.arqulat.loom_backend.dto.Responses.FileSummaryDTO;
import com.arqulat.loom_backend.model.DiagramFile;
import com.arqulat.loom_backend.model.Project;
import com.arqulat.loom_backend.repository.DiagramFileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FileService {

    @Autowired
    private DiagramFileRepository fileRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<FileSummaryDTO> getProjectFiles(UUID projectId, UUID userId) {
        projectService.getProjectIfOwned(projectId, userId); // Ensure ownership
        List<DiagramFile> files = fileRepository.findByProjectIdOrderByUpdatedAtDesc(projectId);
        return files.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FileDetailDTO getFileDetail(UUID fileId, UUID userId) {
        DiagramFile file = getFileIfOwned(fileId, userId);
        return mapToDetail(file);
    }

    @Transactional
    public FileSummaryDTO createFile(UUID projectId, UUID userId, CreateFileRequest request) {
        Project project = projectService.getProjectIfOwned(projectId, userId);
        DiagramFile file = DiagramFile.builder()
                .name(request.getName())
                .canvasBgColor(request.getBackgroundColor() != null ? request.getBackgroundColor() : "#0f0f0f")
                .project(project)
                .nodes(objectMapper.createArrayNode())
                .build();
        
        DiagramFile saved = fileRepository.save(file);
        // Also update project's updated_at timestamp
        project.setUpdatedAt(java.time.LocalDateTime.now());
        return mapToSummary(saved);
    }

    @Transactional
    public FileDetailDTO updateFile(UUID fileId, UUID userId, UpdateFileRequest request) {
        DiagramFile file = getFileIfOwned(fileId, userId);
        if (request.getName() != null) {
            file.setName(request.getName());
        }
        if (request.getCanvasBgColor() != null) {
            file.setCanvasBgColor(request.getCanvasBgColor());
        }
        if (request.getNodes() != null) {
            file.setNodes(request.getNodes());
        }
        DiagramFile updated = fileRepository.save(file);
        // Also update project's updated_at timestamp
        updated.getProject().setUpdatedAt(java.time.LocalDateTime.now());
        return mapToDetail(updated);
    }

    @Transactional
    public void deleteFile(UUID fileId, UUID userId) {
        DiagramFile file = getFileIfOwned(fileId, userId);
        fileRepository.delete(file);
    }

    private DiagramFile getFileIfOwned(UUID fileId, UUID userId) {
        DiagramFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new com.arqulat.loom_backend.exception.ResourceNotFoundException("File not found"));
        if (!file.getProject().getUserId().equals(userId)) {
            throw new com.arqulat.loom_backend.exception.UnauthorizedAccessException("Unauthorized to access this file");
        }
        return file;
    }

    private FileSummaryDTO mapToSummary(DiagramFile file) {
        int nodeCount = 0;
        if (file.getNodes() != null && file.getNodes().isArray()) {
            nodeCount = file.getNodes().size();
        }
        return FileSummaryDTO.builder()
                .id(file.getId())
                .name(file.getName())
                .canvasBgColor(file.getCanvasBgColor())
                .nodeCount(nodeCount)
                .updatedAt(file.getUpdatedAt() != null ? file.getUpdatedAt().toInstant(ZoneOffset.UTC).toEpochMilli() : System.currentTimeMillis())
                .build();
    }

    private FileDetailDTO mapToDetail(DiagramFile file) {
        return FileDetailDTO.builder()
                .id(file.getId())
                .name(file.getName())
                .canvasBgColor(file.getCanvasBgColor())
                .nodes(file.getNodes())
                .updatedAt(file.getUpdatedAt() != null ? file.getUpdatedAt().toInstant(ZoneOffset.UTC).toEpochMilli() : System.currentTimeMillis())
                .build();
    }
}
