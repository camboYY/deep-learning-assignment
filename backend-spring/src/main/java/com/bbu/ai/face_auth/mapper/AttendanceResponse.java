package com.bbu.ai.face_auth.mapper;

import java.time.LocalDateTime;
@lombok.Builder
public record AttendanceResponse(
        Long id,
        Long employeeId,
        String employeeName,
        LocalDateTime checkIn,
        LocalDateTime checkOut,
        String status,
        String note,
        String overTime,
        String location,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
