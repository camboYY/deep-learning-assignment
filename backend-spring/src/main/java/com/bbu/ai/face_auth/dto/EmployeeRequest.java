package com.bbu.ai.face_auth.dto;

import com.bbu.ai.face_auth.models.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeRequest {
    private String name;
    private LocalDate dob;
    private Gender gender;
    private String imageUrl;
}
