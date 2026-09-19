package com.jobportal.dto;

import com.jobportal.model.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String companyName;

    @NotBlank
    private String location;

    @NotNull
    private JobType jobType;

    private Double minSalary;
    private Double maxSalary;

    @NotNull
    private Integer minExperienceYears;

    private Integer maxExperienceYears;

    private String skillsRequired;
}
