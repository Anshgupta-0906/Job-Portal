package com.jobportal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please attach a resume file");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Resume file must be 5MB or smaller");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Resume must be a PDF, DOC, or DOCX file");
        }

        try {
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "resume" : file.getOriginalFilename());
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String storedName = UUID.randomUUID() + extension;
            Path targetPath = dirPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath);

            return storedName;
        } catch (IOException e) {
            throw new IllegalStateException("Could not save the resume file. Please try again.");
        }
    }

    public Resource load(String storedFilename) {
        try {
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = dirPath.resolve(storedFilename).normalize();

            if (!filePath.startsWith(dirPath)) {
                throw new IllegalArgumentException("Invalid file reference");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("Resume file could not be found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Resume file could not be found");
        }
    }
}
