package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.model.Job;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public JobResponse postJob(JobRequest request) {
        User employer = currentUser();
        if (employer.getRole() != Role.EMPLOYER) {
            throw new IllegalStateException("Only employer accounts can post jobs");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompanyName(request.getCompanyName());
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setMinExperienceYears(request.getMinExperienceYears());
        job.setMaxExperienceYears(request.getMaxExperienceYears());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setEmployer(employer);

        return toResponse(jobRepository.save(job));
    }

    public List<JobResponse> searchJobs(String keyword, String location, Integer experience) {
        return jobRepository.search(
                        (keyword == null || keyword.isBlank()) ? null : keyword,
                        (location == null || location.isBlank()) ? null : location,
                        experience)
                .stream().map(this::toResponse).toList();
    }

    public JobResponse getJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        return toResponse(job);
    }

    public List<JobResponse> myJobs() {
        User employer = currentUser();
        return jobRepository.findByEmployerOrderByPostedAtDesc(employer)
                .stream().map(this::toResponse).toList();
    }

    public void closeJob(Long id) {
        User employer = currentUser();
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new IllegalStateException("You can only manage your own job postings");
        }
        job.setActive(false);
        jobRepository.save(job);
    }

    private JobResponse toResponse(Job job) {
        return new JobResponse(
                job.getId(), job.getTitle(), job.getDescription(), job.getCompanyName(),
                job.getLocation(), job.getJobType(), job.getMinSalary(), job.getMaxSalary(),
                job.getMinExperienceYears(), job.getMaxExperienceYears(),
                job.getSkillsRequired(), job.getEmployer().getId(), job.getEmployer().getFullName(),
                job.getPostedAt(), job.isActive()
        );
    }
}
