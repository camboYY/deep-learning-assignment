package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.UserDTO;
import com.bbu.ai.face_auth.dto.UserRequest;
import com.bbu.ai.face_auth.mapper.UserMapper;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users in the HR Attendance system")
public class UserController {

    private final UserService userService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("POST works");
    }

    @GetMapping("/all")
    @Operation(summary = "Get all users")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(UserMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create user")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserRequest request, HttpServletRequest req) {
        System.out.println("Request URL: ");

        User user = userService.createUser(UserMapper.toEntity(request));
        System.out.println("Authorization: {} "+user);

        return ResponseEntity.ok(UserMapper.toDTO(user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        User updated = userService.updateUser(id, request);
        return ResponseEntity.ok(UserMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
