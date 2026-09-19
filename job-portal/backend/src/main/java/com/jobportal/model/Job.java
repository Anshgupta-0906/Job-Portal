package com.jobportal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobType jobType;

    private Double minSalary;
    private Double maxSalary;

    @Column(nullable = false)
    private Integer minExperienceYears = 0;

    private Integer maxExperienceYears;

    @Column(length = 2000)
    private String skillsRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @Column(updatable = false)
    private LocalDateTime postedAt;

    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        this.postedAt = LocalDateTime.now();
    }
}
