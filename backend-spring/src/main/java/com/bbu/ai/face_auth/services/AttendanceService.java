package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.AttendanceRequest;
import com.bbu.ai.face_auth.models.Attendance;
import com.bbu.ai.face_auth.models.EAttendeneStatus;
import com.bbu.ai.face_auth.repository.AttendanceRepository;
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


    public AttendanceService(
            AttendanceRepository attendanceRepository
    ) {
        this.attendanceRepository = attendanceRepository;
    }

    public Attendance create(AttendanceRequest attendanceRequest){
        logger.info("attendanceRequest{}", attendanceRequest);
        // Create new student's account
        Attendance attendance = new Attendance();
        attendance.setEmployeeId(attendanceRequest.getEmployeeId());
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus(EAttendeneStatus.valueOf(attendanceRequest.getStatus()));
        return attendanceRepository.save(attendance);
    }

    public Page<Attendance> getAll(Pageable pageable) {
            return attendanceRepository.findAll(pageable);
    }
    public Page<Attendance> getByEmployeeId(Long id, Pageable pageable) {
        return attendanceRepository.findByEmployeeId(id, pageable);
    }

    public Optional<Attendance> getById(Long id){
        Optional<Attendance> attendance = attendanceRepository.findById(id);
        return attendance;
    }

    public Attendance update(Long id, AttendanceRequest attendanceRequest){
        logger.info("attendanceRequest{}", attendanceRequest);
        // Create new student's account
        Optional<Attendance> attendanceData = getById(id);
        if(attendanceData.isPresent()){
            Attendance attendance = attendanceData.get();
            attendance.setEmployeeId(attendanceRequest.getEmployeeId());
            attendance.setStatus(EAttendeneStatus.valueOf(attendanceRequest.getStatus()));
            attendance.setCheckOut(LocalDateTime.now());
            return attendanceRepository.save(attendance);
        }else{
            return null;
        }

    }

    public void delete(Long id){
        attendanceRepository.deleteById(id);
    }

}
