package com.bbu.ai.face_auth.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "attendances")
@Entity
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime checkIn;
    @Column(nullable = true)
    private LocalDateTime checkOut;
    @Enumerated(EnumType.STRING)
    private EnumAttendanceStatus status;
    @Column(columnDefinition = "TEXT",nullable = true)
    private String note;
    @Column(nullable = true)
    private String overTime;
    @Column(nullable = true)
    private String location;

    @CreationTimestamp
    private Timestamp createdAt;
    @UpdateTimestamp
    private Timestamp updatedAt;

    @Column(nullable = false)
    private Long employeeId;

}
