package com.bbu.ai.face_auth.mapper;

import com.bbu.ai.face_auth.dto.EmployeeDTO;
import com.bbu.ai.face_auth.dto.EmployeeRequest;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.models.Gender;
import com.bbu.ai.face_auth.models.User;

public class EmployeeMapper {

    public static EmployeeDTO toDTO(Employee employee) {
        if (employee == null) return null;

        return EmployeeDTO.builder()
                .id(employee.getId())
                .name(employee.getName())
                .dob(employee.getDob())
                .gender(employee.getGender() != null ? employee.getGender().name() : null)
                .imageUrl(employee.getImageUrl())
                .department(employee.getDepartment())
                .userId(employee.getUser() != null ? employee.getUser().getId() : null)
                .build();
    }

    public static Employee toEntity(EmployeeRequest request, User user) {
        return Employee.builder()
                .name(request.getName())
                .dob(request.getDob())
                .gender(request.getGender() != null ? Gender.valueOf(request.getGender()) : null)
                .imageUrl(request.getImageUrl())
                .department(request.getDepartment())
                .user(user)
                .build();
    }
}
