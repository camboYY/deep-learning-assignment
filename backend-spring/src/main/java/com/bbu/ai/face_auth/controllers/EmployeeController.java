package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.EmployeeDTO;
import com.bbu.ai.face_auth.dto.EmployeeRequest;
import com.bbu.ai.face_auth.mapper.EmployeeMapper;
import com.bbu.ai.face_auth.models.Employee;
import com.bbu.ai.face_auth.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/employee")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<EmployeeDTO> create(@Valid @RequestBody EmployeeRequest request) {
        Employee employee = employeeService.create(request);
        return ResponseEntity.ok(EmployeeMapper.toDTO(employee));
    }

    @GetMapping("/all")
    public ResponseEntity<Page<EmployeeDTO>> getAll(
            @RequestParam(value = "name", defaultValue = "") String name,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employees = employeeService.getAll(name, pageable);
        return ResponseEntity.ok(employees.map(EmployeeMapper::toDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getById(@PathVariable Long id) {
        return employeeService.getById(id)
                .map(EmployeeMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDTO> update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        Employee employee = employeeService.update(id, request);
        return ResponseEntity.ok(EmployeeMapper.toDTO(employee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok("Employee deleted!");
    }
}
