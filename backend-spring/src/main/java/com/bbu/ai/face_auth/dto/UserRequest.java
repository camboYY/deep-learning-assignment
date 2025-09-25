package com.bbu.ai.face_auth.dto;

import com.bbu.ai.face_auth.models.EnumRole;
import lombok.Data;

import java.util.Set;

@Data
public class UserRequest {
    private String name;
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    private Set<EnumRole> roles;
}
