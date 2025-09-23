package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.AttendanceRequest;
import com.bbu.ai.face_auth.mapper.AttendanceResponse;
import com.bbu.ai.face_auth.models.Attendance;
import com.bbu.ai.face_auth.services.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Mark attendance via webcam (face recognition gives employeeId)
    @PostMapping("/mark/{employeeId}")
    public ResponseEntity<Attendance> markAttendance(@PathVariable Long employeeId, @RequestParam(required = false) String note,
                                                     HttpServletRequest request) {
        String location = getClientLocation(request);
        Attendance attendance = attendanceService.markAttendance(employeeId, note, location);

        return ResponseEntity.ok(attendance);
    }

    @PostMapping()
    public ResponseEntity<?> create(@Valid @RequestBody AttendanceRequest attendanceRequest){
        Attendance attendance = attendanceService.create(attendanceRequest);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping()
    public ResponseEntity<Page<AttendanceResponse>> getAll(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AttendanceResponse> attendances = attendanceService.getAll(pageable);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Page<AttendanceResponse>> getByEmployeeId(
            @PathVariable(value = "id") Long employeeId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AttendanceResponse> attendances = attendanceService.getByEmployeeId(employeeId, pageable);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable(value = "id") Long id) {
        Optional<Attendance> attendance = attendanceService.getById(id);
        return ResponseEntity.ok(attendance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable(value = "id") Long id, @Valid @RequestBody AttendanceRequest attendanceRequest){
        Attendance attendance = attendanceService.update(id, attendanceRequest);
        if(attendance != null){
            return ResponseEntity.ok(attendance);
        }else{
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable(value = "id") Long id){
        Optional<Attendance> attendance = attendanceService.getById(id);
        if(attendance.isPresent()){
            attendanceService.delete(id);
            return ResponseEntity.ok("Attendance deleted!");
        }

        return ResponseEntity.notFound().build();

    }

    public String getClientLocation(HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        // You can integrate with a GeoIP service (e.g., MaxMind DB, or ip-api.com)
        // Example pseudo:
        return "Phnom Penh, Cambodia (IP: " + clientIp + ")";
    }

}
