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

import com.arqulat.loom_backend.dto.FileRequests.CreateFileRequest;
import com.arqulat.loom_backend.dto.FileRequests.UpdateFileRequest;
import com.arqulat.loom_backend.dto.Responses.FileDetailDTO;
import com.arqulat.loom_backend.dto.Responses.FileSummaryDTO;
import com.arqulat.loom_backend.dto.Responses.FileVersionDTO;
import com.arqulat.loom_backend.service.FileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class FileController {

    @Autowired
    private FileService fileService;

    // Project files nested route
    @GetMapping("/projects/{projectId}/files")
    public List<FileSummaryDTO> getProjectFiles(@PathVariable UUID projectId, Authentication authentication) {
        return fileService.getProjectFiles(projectId, (UUID) authentication.getPrincipal());
    }

    @PostMapping("/projects/{projectId}/files")
    @ResponseStatus(HttpStatus.CREATED)
    public FileSummaryDTO createFile(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateFileRequest request,
            Authentication authentication) {
        return fileService.createFile(projectId, (UUID) authentication.getPrincipal(), request);
    }

    // Direct file routes
    @GetMapping("/files/{fileId}")
    public FileDetailDTO getFileDetail(@PathVariable UUID fileId, Authentication authentication) {
        return fileService.getFileDetail(fileId, (UUID) authentication.getPrincipal());
    }

    @PutMapping("/files/{fileId}")
    public FileDetailDTO updateFile(
            @PathVariable UUID fileId,
            @Valid @RequestBody UpdateFileRequest request,
            Authentication authentication) {
        return fileService.updateFile(fileId, (UUID) authentication.getPrincipal(), request);
    }

    @DeleteMapping("/files/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFile(@PathVariable UUID fileId, Authentication authentication) {
        fileService.deleteFile(fileId, (UUID) authentication.getPrincipal());
    }

    @GetMapping("/files/{fileId}/versions")
    public List<FileVersionDTO> getFileVersions(@PathVariable UUID fileId, Authentication authentication) {
        return fileService.getFileVersions(fileId, (UUID) authentication.getPrincipal());
    }

    @PostMapping("/files/{fileId}/versions/{versionId}/restore")
    public FileDetailDTO restoreFileVersion(
            @PathVariable UUID fileId,
            @PathVariable UUID versionId,
            Authentication authentication) {
        return fileService.restoreFileVersion(fileId, versionId, (UUID) authentication.getPrincipal());
    }
}
