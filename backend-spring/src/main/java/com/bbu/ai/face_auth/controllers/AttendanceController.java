package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.AttendanceRequest;
import com.bbu.ai.face_auth.models.Attendance;
import com.bbu.ai.face_auth.services.AttendanceService;
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

    @PostMapping()
    public ResponseEntity<?> create(@Valid @RequestBody AttendanceRequest attendanceRequest){
        Attendance attendance = attendanceService.create(attendanceRequest);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping()
    public ResponseEntity<?> getAll(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Attendance> attendances = attendanceService.getAll(pageable);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/getByEmployeeId/{id}")
    public ResponseEntity<?> getByEmployeeId(
            @PathVariable(value = "id") Long id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Attendance> attendances = attendanceService.getByEmployeeId(id, pageable);
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
        }else{
            return ResponseEntity.notFound().build();
        }

    }


}
