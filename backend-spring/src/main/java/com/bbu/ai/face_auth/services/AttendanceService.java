package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.AttendanceRequest;
import com.bbu.ai.face_auth.models.Attendance;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.mapper.AttendanceResponse;
import com.bbu.ai.face_auth.models.EnumAttendanceStatus;
import com.bbu.ai.face_auth.repository.AttendanceRepository;
import com.bbu.ai.face_auth.repository.EmployeeRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AttendanceService {

    private static final Logger logger = LogManager.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;


    public AttendanceService(
            AttendanceRepository attendanceRepository
            , EmployeeRepository employeeRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public Attendance create(AttendanceRequest attendanceRequest){
        logger.info("attendanceRequest{}", attendanceRequest);

        // Create new student's account
        Attendance attendance = new Attendance();
        attendance.setEmployee(getEmployee(attendanceRequest.getEmployeeId()));
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus(attendanceRequest.getStatus());
        return attendanceRepository.save(attendance);
    }

    public Page<AttendanceResponse> getAll(Pageable pageable) {

        Page<Attendance> attendances = attendanceRepository.findAll(pageable);
        return attendances.map(a -> new AttendanceResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getName(), // fetch from Employee repo
                a.getCheckIn(),
                a.getCheckOut(),
                a.getStatus().name(),
                a.getNote(),
                a.getOverTime(),
                a.getLocation(),
                a.getCreatedAt().toLocalDateTime(),
                a.getUpdatedAt().toLocalDateTime()
        ));
    }

    public Page<AttendanceResponse> getByEmployeeId(Long employeeId, Pageable pageable) {
        Page<Attendance> attendances = attendanceRepository.findByEmployeeId(employeeId, pageable);

        return attendances.map(a -> new AttendanceResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().getName(), // fetch from Employee repo
                a.getCheckIn(),
                a.getCheckOut(),
                a.getStatus().name(),
                a.getNote(),
                a.getOverTime(),
                a.getLocation(),
                a.getCreatedAt().toLocalDateTime(),
                a.getUpdatedAt().toLocalDateTime()
        ));    }

    public Optional<Attendance> getById(Long id){
        return attendanceRepository.findById(id);
    }

    public Attendance update(Long id, AttendanceRequest attendanceRequest){
        logger.info("attendanceRequest{}", attendanceRequest);
        // Create new student's account
        Optional<Attendance> attendanceData = getById(id);
        if(attendanceData.isPresent()){
            Attendance attendance = attendanceData.get();
            attendance.setEmployee(getEmployee(attendanceRequest.getEmployeeId()));
            attendance.setStatus(attendanceRequest.getStatus());
            attendance.setCheckOut(LocalDateTime.now());
            return attendanceRepository.save(attendance);
        }else{
            return null;
        }

    }

    public void delete(Long id){
        attendanceRepository.deleteById(id);
    }

    public AttendanceResponse markAttendance(Long employeeId, String note, String location) {
        Attendance attendance;

        Optional<Attendance> existingAttendance =
                attendanceRepository.findTopByEmployeeIdAndCheckOutIsNullOrderByCheckInDesc(employeeId);

        if (existingAttendance.isPresent()) {
            // Checkout flow
            attendance = existingAttendance.get();
            attendance.setCheckOut(LocalDateTime.now());
            attendance.setStatus(EnumAttendanceStatus.PRESENT);
            attendance.setOverTime(calculateOvertime(attendance.getCheckIn(), attendance.getCheckOut()));
        } else {
            // Check-in flow
            attendance = new Attendance();
            attendance.setCheckIn(LocalDateTime.now());
            attendance.setStatus(EnumAttendanceStatus.PRESENT);
        }

        attendance.setEmployee(getEmployee(employeeId));
        if (note != null) attendance.setNote(note);
        if (location != null) attendance.setLocation(location);

        Attendance saved = attendanceRepository.save(attendance);

        return new AttendanceResponse(
                saved.getId(),
                saved.getEmployee().getId(),
                saved.getEmployee().getName(),
                saved.getCheckIn(),
                saved.getCheckOut(),
                saved.getStatus().name(),
                saved.getNote(),
                saved.getOverTime(),
                saved.getLocation(),
                saved.getCreatedAt().toLocalDateTime(),
                saved.getUpdatedAt().toLocalDateTime()
        );
    }


    // Calculate overtime
    private String calculateOvertime(LocalDateTime checkIn, LocalDateTime checkOut) {
        if (checkIn == null || checkOut == null) return null;

        long minutes = java.time.Duration.between(checkIn, checkOut).toMinutes();
        long standardMinutes = 8 * 60; // 8 hours
        if (minutes > standardMinutes) {
            long overtimeMinutes = minutes - standardMinutes;
            long hours = overtimeMinutes / 60;
            long mins = overtimeMinutes % 60;
            return hours + "h " + mins + "m";
        }
        return "0h 0m";
    }


    private Employee getEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));
    }
}
