package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.StudentRequest;
import com.bbu.ai.face_auth.models.EAttendeneStatus;
import com.bbu.ai.face_auth.models.EGender;
import com.bbu.ai.face_auth.models.Student;
import com.bbu.ai.face_auth.repository.StudentRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private static final Logger logger = LogManager.getLogger(StudentService.class);

    private final StudentRepository studentRepository;


    public StudentService(
            StudentRepository studentRepository
    ) {
        this.studentRepository = studentRepository;
    }

    public Student create(StudentRequest studentRequest){
        logger.info("StudentRequest{}", studentRequest);
        // Create new student's account
        Student student = new Student();
        student.setName(studentRequest.getName());
        student.setDob(studentRequest.getDob());
        student.setGender(EGender.valueOf(studentRequest.getGender()));
        student.setStatus(EAttendeneStatus.valueOf(studentRequest.getStatus()));
        student.setCheckin(studentRequest.getCheckin());
        student.setCheckout(studentRequest.getCheckout());
        return studentRepository.save(student);
    }

    public List<Student> getAll(){
        List<Student> students = studentRepository.findAll();
        return students;
    }

    public Optional<Student> getById(Long id){
        Optional<Student> student = studentRepository.findById(id);
        return student;
    }

    public Student update(Long id, StudentRequest studentRequest){
        logger.info("StudentRequest{}", studentRequest);
        // Create new student's account
        Student student = studentRepository.getById(id);
        student.setName(studentRequest.getName());
        student.setDob(studentRequest.getDob());
        student.setGender(EGender.valueOf(studentRequest.getGender()));
        student.setStatus(EAttendeneStatus.valueOf(studentRequest.getStatus()));
        student.setCheckin(studentRequest.getCheckin());
        student.setCheckout(studentRequest.getCheckout());
        return studentRepository.save(student);
    }

    public void delete(Long id){
        studentRepository.deleteById(id);
    }

}
