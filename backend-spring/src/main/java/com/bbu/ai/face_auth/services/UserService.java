package com.bbu.ai.face_auth.services;

import com.bbu.ai.face_auth.dto.UserRequest;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.models.UserRole;
import com.bbu.ai.face_auth.repository.RoleRepository;
import com.bbu.ai.face_auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(User user) {
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Set<UserRole> managedRoles = user.getRoles().stream()
                    .map(r -> roleRepository.findByName(r.getName())
                            .orElseThrow(() -> new RuntimeException("Role not found: " + r.getName())))
                    .collect(Collectors.toSet());
            user.setRoles(managedRoles);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword())); // encode password
        return userRepository.save(user);
    }

    public User updateUser(Long id, UserRequest request) {
        return userRepository.findById(id).map(user -> {
            user.setName(request.getName());
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPassword(request.getPassword());

            if (request.getRoles() != null) {
                user.setRoles(
                        request.getRoles().stream()
                                .map(roleName -> roleRepository.findByName(roleName)
                                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName))
                                )
                                .collect(Collectors.toSet())
                );
            }

            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }


    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
