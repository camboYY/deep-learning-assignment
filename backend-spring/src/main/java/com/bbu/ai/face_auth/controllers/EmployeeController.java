package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.EmployeeRequest;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.services.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping()
    public ResponseEntity<?> create(@Valid @RequestBody EmployeeRequest employeeRequest){
        Employee employee = employeeService.create(employeeRequest);
        return ResponseEntity.ok(employee);
    }

    @GetMapping()
    public ResponseEntity<?> getAll(
            @RequestParam(value = "name", defaultValue = "") String name,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employees = employeeService.getAll(name, pageable);

        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable(value = "id") Long id) {
        Optional<Employee> student = employeeService.getById(id);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable(value = "id") Long id, @Valid @RequestBody EmployeeRequest employeeRequest){
        Employee employee = employeeService.update(id, employeeRequest);
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable(value = "id") Long id){
        Optional<Employee> student = employeeService.getById(id);
        if(student.isPresent()){
            employeeService.delete(id);
            return ResponseEntity.ok("Student deleted!");
        }else{
            return ResponseEntity.notFound().build();
        }

    }


}
