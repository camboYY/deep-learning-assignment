package com.bbu.ai.face_auth.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmployeeRequest {
    private String name;
    private LocalDateTime dob;
    private String gender;
    private String imageUrl;
}
