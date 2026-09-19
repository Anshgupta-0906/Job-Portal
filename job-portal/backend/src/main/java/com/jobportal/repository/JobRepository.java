package com.jobportal.repository;

import com.jobportal.model.Job;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByEmployerOrderByPostedAtDesc(User employer);

    @Query("SELECT j FROM Job j WHERE j.active = true AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "  OR LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:experience IS NULL OR (j.minExperienceYears <= :experience AND " +
           "  (j.maxExperienceYears IS NULL OR :experience <= j.maxExperienceYears))) " +
           "ORDER BY j.postedAt DESC")
    List<Job> search(@Param("keyword") String keyword, @Param("location") String location,
                      @Param("experience") Integer experience);
}
