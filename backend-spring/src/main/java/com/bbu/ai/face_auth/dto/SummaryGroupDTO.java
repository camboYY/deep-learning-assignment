package com.bbu.ai.face_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryGroupDTO {
    private String title;
    private List<SummaryGroupItemDTO> items;

}
