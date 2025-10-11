package com.bbu.ai.face_auth.repository;

import com.bbu.ai.face_auth.models.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Page<Attendance> findByEmployeeId(long employeeId, Pageable pageable);
    Optional<Attendance> findTopByEmployeeIdAndCheckOutIsNullOrderByCheckInDesc(Long employeeId);

    @Query(value = "SELECT * FROM attendances a WHERE DATE(a.check_in) = CURRENT_DATE", nativeQuery = true)
    List<Attendance> findTodayAttendances();

}
