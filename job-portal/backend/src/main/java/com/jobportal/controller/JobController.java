package com.jobportal.controller;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> postJob(@Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.postJob(request));
    }

    @GetMapping
    public ResponseEntity<List<JobResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer experience) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, experience));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<JobResponse>> myJobs() {
        return ResponseEntity.ok(jobService.myJobs());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> closeJob(@PathVariable Long id) {
        jobService.closeJob(id);
        return ResponseEntity.noContent().build();
    }
}
