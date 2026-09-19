package com.jobportal.dto;

import com.jobportal.model.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String coverLetter;
    private String resumeFileName;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}
