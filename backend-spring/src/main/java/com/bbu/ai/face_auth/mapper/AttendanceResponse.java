package com.bbu.ai.face_auth.mapper;

import com.bbu.ai.face_auth.models.Employee;

import java.time.LocalDateTime;

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
