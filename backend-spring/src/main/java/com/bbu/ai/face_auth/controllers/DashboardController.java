package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.SummaryGroupDTO;
import com.bbu.ai.face_auth.services.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summaryGroups")
    public List<SummaryGroupDTO> getSummary() {
        return dashboardService.getAttendanceSummary();
    }

    // Colored status cards
    @GetMapping("/statusCards")
    public Map<String, Long> getStatusCards() {
        return dashboardService.getStatusCards();
    }
}
