package com.jobportal.dto;

import com.jobportal.model.JobType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private JobType jobType;
    private Double minSalary;
    private Double maxSalary;
    private Integer minExperienceYears;
    private Integer maxExperienceYears;
    private String skillsRequired;
    private Long employerId;
    private String employerName;
    private LocalDateTime postedAt;
    private boolean active;
}
