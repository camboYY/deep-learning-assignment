package com.bbu.ai.face_auth.dto;

import com.bbu.ai.face_auth.models.EAttendeneStatus;
import com.bbu.ai.face_auth.models.Employee;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttendanceRequest {
    private Long employeeId;
    private String status = "PRESENT";
}
