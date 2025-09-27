package com.bbu.ai.face_auth.dto;

import com.bbu.ai.face_auth.models.EnumAttendanceStatus;
import lombok.Data;


@Data
public class AttendanceRequest {
    private Long employeeId;
    private EnumAttendanceStatus status ;
    private String note;
}
