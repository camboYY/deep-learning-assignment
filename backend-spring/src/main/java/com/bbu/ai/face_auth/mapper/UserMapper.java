package com.bbu.ai.face_auth.mapper;

import com.bbu.ai.face_auth.dto.UserDTO;
import com.bbu.ai.face_auth.dto.UserRequest;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.models.UserRole;

import java.util.stream.Collectors;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .build();
    }

    public static User toEntity(UserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());

        if (request.getRoles() != null) {
            user.setRoles(
                    request.getRoles().stream()
                            .map(UserRole::new)
                            .collect(Collectors.toSet())
            );
        }

        return user;
    }
}
