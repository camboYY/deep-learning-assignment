package com.bbu.ai.face_auth.services;

import com.bbu.ai.face_auth.dto.SummaryGroupDTO;
import com.bbu.ai.face_auth.dto.SummaryGroupItemDTO;
import com.bbu.ai.face_auth.models.Attendance;
import com.bbu.ai.face_auth.models.EnumAttendanceStatus;
import com.bbu.ai.face_auth.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {
    private final AttendanceRepository attendanceRepository;

    public DashboardService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public List<SummaryGroupDTO> getAttendanceSummary() {

        // 2️⃣ Fetch all attendance records for today
        List<Attendance> todaysAttendances = attendanceRepository.findTodayAttendances();

        // 3️⃣ Count by status
        Map<EnumAttendanceStatus, Long> counts = new EnumMap<>(EnumAttendanceStatus.class);
        for (Attendance attendance : todaysAttendances) {
            counts.put(attendance.getStatus(),
                    counts.getOrDefault(attendance.getStatus(), 0L) + 1);
        }

        // 4️⃣ Build summaryGroups
        List<SummaryGroupDTO> summaryGroups = new ArrayList<>();

        summaryGroups.add(new SummaryGroupDTO("Present Summary", List.of(
                new SummaryGroupItemDTO("On time", counts.getOrDefault(EnumAttendanceStatus.PRESENT, 0L)),
                new SummaryGroupItemDTO("Late clock-in", counts.getOrDefault(EnumAttendanceStatus.LATE, 0L)),
                new SummaryGroupItemDTO("Overtime", counts.getOrDefault(EnumAttendanceStatus.OVERTIME, 0L))
        )));

        summaryGroups.add(new SummaryGroupDTO("Not Present Summary", List.of(
                new SummaryGroupItemDTO("Absent", counts.getOrDefault(EnumAttendanceStatus.ABSENT, 0L)),
                new SummaryGroupItemDTO("No clock-in", 0L), // placeholder
                new SummaryGroupItemDTO("No clock-out", 0L) // placeholder
        )));

        summaryGroups.add(new SummaryGroupDTO("Away Summary", List.of(
                new SummaryGroupItemDTO("Day off", 0L),
                new SummaryGroupItemDTO("Time off", 0L)
        )));

        return summaryGroups;
    }
    // 2️⃣ Status cards (colored boxes)
    public Map<String, Long> getStatusCards() {

        List<Attendance> attendances = attendanceRepository.findTodayAttendances();

        Map<EnumAttendanceStatus, Long> counts = new EnumMap<>(EnumAttendanceStatus.class);
        for (Attendance a : attendances) {
            counts.put(a.getStatus(), counts.getOrDefault(a.getStatus(), 0L) + 1);
        }

        Map<String, Long> statusCards = new HashMap<>();
        statusCards.put("On Time", counts.getOrDefault(EnumAttendanceStatus.PRESENT, 0L));
        statusCards.put("Late", counts.getOrDefault(EnumAttendanceStatus.LATE, 0L));
        statusCards.put("Absent", counts.getOrDefault(EnumAttendanceStatus.ABSENT, 0L));
        statusCards.put("Overtime", counts.getOrDefault(EnumAttendanceStatus.OVERTIME, 0L));

        return statusCards;
    }
}
