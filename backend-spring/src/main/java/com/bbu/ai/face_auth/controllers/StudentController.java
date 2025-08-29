package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.StudentRequest;
import com.bbu.ai.face_auth.models.Student;
import com.bbu.ai.face_auth.services.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping()
    public ResponseEntity<?> create(@Valid @RequestBody StudentRequest studentRequest){
        Student student = studentService.create(studentRequest);
        return ResponseEntity.ok(student);
    }

    @GetMapping()
    public ResponseEntity<?> getAll() {
        List<Student> students = studentService.getAll();
        return ResponseEntity.ok(students);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable(value = "id") Long id) {
        Optional<Student> student = studentService.getById(id);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable(value = "id") Long id, @Valid @RequestBody StudentRequest studentRequest){
        Student student = studentService.update(id, studentRequest);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable(value = "id") Long id){
        Optional<Student> student = studentService.getById(id);
        if(student.isPresent()){
            studentService.delete(id);
            return ResponseEntity.ok("Student deleted!");
        }else{
            return ResponseEntity.notFound().build();
        }

    }


}
