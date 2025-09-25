package com.bbu.ai.face_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String name;
    private LocalDate dob;
    private String gender; // Optional: store as String for DTO
    private String imageUrl;
    private String department;
    private Long userId;

}
