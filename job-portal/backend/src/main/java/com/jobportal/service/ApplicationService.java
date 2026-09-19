package com.jobportal.service;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;
    private final FileStorageService fileStorageService;

    public ApplicationResponse apply(Long jobId, String coverLetter, MultipartFile resume) {
        User candidate = jobService.currentUser();
        if (candidate.getRole() != Role.CANDIDATE) {
            throw new IllegalStateException("Only candidate accounts can apply to jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (applicationRepository.existsByJobAndCandidate(job, candidate)) {
            throw new IllegalStateException("You have already applied to this job");
        }

        String storedFilename = fileStorageService.store(resume);

        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setCoverLetter(coverLetter);
        application.setResumeOriginalFilename(resume.getOriginalFilename());
        application.setResumeStoredFilename(storedFilename);
        application.setResumeContentType(resume.getContentType());

        return toResponse(applicationRepository.save(application));
    }

    public List<ApplicationResponse> myApplications() {
        User candidate = jobService.currentUser();
        return applicationRepository.findByCandidateOrderByAppliedAtDesc(candidate)
                .stream().map(this::toResponse).toList();
    }

    public List<ApplicationResponse> applicantsForJob(Long jobId) {
        User employer = jobService.currentUser();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new IllegalStateException("You can only view applicants for your own job postings");
        }

        return applicationRepository.findByJobOrderByAppliedAtDesc(job)
                .stream().map(this::toResponse).toList();
    }

    public ApplicationResponse updateStatus(Long applicationId, com.jobportal.model.ApplicationStatus status) {
        User employer = jobService.currentUser();
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new IllegalStateException("You can only manage applications for your own job postings");
        }

        application.setStatus(status);
        return toResponse(applicationRepository.save(application));
    }

    public record ResumeFile(Resource resource, String originalFilename, String contentType) {}

    public ResumeFile getResume(Long applicationId) {
        User user = jobService.currentUser();
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        boolean isOwningCandidate = application.getCandidate().getId().equals(user.getId());
        boolean isOwningEmployer = application.getJob().getEmployer().getId().equals(user.getId());

        if (!isOwningCandidate && !isOwningEmployer) {
            throw new IllegalStateException("You do not have access to this resume");
        }

        if (application.getResumeStoredFilename() == null) {
            throw new IllegalArgumentException("No resume was attached to this application");
        }

        Resource resource = fileStorageService.load(application.getResumeStoredFilename());
        return new ResumeFile(resource, application.getResumeOriginalFilename(), application.getResumeContentType());
    }

    private ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getJob().getId(),
                application.getJob().getTitle(),
                application.getJob().getCompanyName(),
                application.getCandidate().getId(),
                application.getCandidate().getFullName(),
                application.getCandidate().getEmail(),
                application.getCoverLetter(),
                application.getResumeOriginalFilename(),
                application.getStatus(),
                application.getAppliedAt()
        );
    }
}

