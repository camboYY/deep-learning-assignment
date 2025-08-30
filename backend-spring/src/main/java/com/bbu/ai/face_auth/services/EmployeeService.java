package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.EmployeeRequest;
import com.bbu.ai.face_auth.models.EGender;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.repository.EmployeeRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployeeService {

    private static final Logger logger = LogManager.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;


    public EmployeeService(
            EmployeeRepository employeeRepository
    ) {
        this.employeeRepository = employeeRepository;
    }

    public Employee create(EmployeeRequest employeeRequest){
        logger.info("StudentRequest{}", employeeRequest);
        // Create new student's account
        Employee employee = new Employee();
        employee.setName(employeeRequest.getName());
        employee.setDob(employeeRequest.getDob());
        employee.setGender(EGender.valueOf(employeeRequest.getGender()));
        employee.setImageUrl(employeeRequest.getImageUrl());
        return employeeRepository.save(employee);
    }

    public Page<Employee> getAll(String name, Pageable pageable) {
        if (!name.isEmpty()) {
            return employeeRepository.findByNameContaining(name, pageable);
        } else {
            return employeeRepository.findAll(pageable);
        }
    }

    public Optional<Employee> getById(Long id){
        Optional<Employee> student = employeeRepository.findById(id);
        return student;
    }

    public Employee update(Long id, EmployeeRequest employeeRequest){
        logger.info("StudentRequest{}", employeeRequest);
        // Create new student's account
        Employee employee = employeeRepository.getById(id);
        employee.setName(employeeRequest.getName());
        employee.setDob(employeeRequest.getDob());
        employee.setGender(EGender.valueOf(employeeRequest.getGender()));
        employee.setImageUrl(employeeRequest.getImageUrl());
        return employeeRepository.save(employee);
    }

    public void delete(Long id){
        employeeRepository.deleteById(id);
    }

}
