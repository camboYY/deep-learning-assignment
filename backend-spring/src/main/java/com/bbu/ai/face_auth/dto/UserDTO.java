package com.bbu.ai.face_auth.dto;

import com.bbu.ai.face_auth.models.EnumRole;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phoneNumber;
    private Set<String> roles;
}
