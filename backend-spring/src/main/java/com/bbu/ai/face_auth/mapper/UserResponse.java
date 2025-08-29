package com.bbu.ai.face_auth.mapper;
import com.bbu.ai.face_auth.models.Role;
import com.bbu.ai.face_auth.models.User;
import lombok.Data;

import java.util.Set;

@Data
public class UserResponse {
    private String username;
    private String name;
    private String email;
    private Set<Role> roles;
    private String PhoneNumber;
    private long id;

    public UserResponse(User registeredUser){
        this.setEmail(registeredUser.getEmail());
        this.setName(registeredUser.getName());
        this.setRoles(registeredUser.getRoles());
        this.setUsername(registeredUser.getUsername());
        this.setPhoneNumber(registeredUser.getPhoneNumber());
        this.setId(registeredUser.getId());
    }
}
