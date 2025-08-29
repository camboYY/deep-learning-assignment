package com.bbu.ai.face_auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CategoryRequest {

    private String name;
    private Integer parentId;

}
