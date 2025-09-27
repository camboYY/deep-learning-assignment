package com.bbu.ai.face_auth.services;

import com.bbu.ai.face_auth.dto.EmployeeRequest;
import com.bbu.ai.face_auth.mapper.EmployeeMapper;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.models.Gender;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.repository.EmployeeRepository;
import com.bbu.ai.face_auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Transactional
    public Employee create(EmployeeRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id " + request.getUserId()));

        employeeRepository.findByUserId(user.getId())
                .ifPresent(e -> { throw new RuntimeException("Employee for this user already exists"); });

        Employee employee = EmployeeMapper.toEntity(request, user);
        return employeeRepository.saveAndFlush(employee); // ensures immediate insert
    }

    @Transactional(readOnly = true)
    public Page<Employee> getAll(String name, Pageable pageable) {
        return employeeRepository.findByNameContaining(name, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Employee> getById(Long id) {
        return employeeRepository.findById(id);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setName(request.getName());
        employee.setDob(request.getDob());
        employee.setGender(request.getGender() != null ? Gender.valueOf(request.getGender()) : null);
        employee.setImageUrl(request.getImageUrl());
        employee.setDepartment(request.getDepartment());

        return employeeRepository.saveAndFlush(employee);
    }

    @Transactional
    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }
}
