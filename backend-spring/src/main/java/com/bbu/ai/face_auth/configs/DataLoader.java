package com.bbu.ai.face_auth.configs;

import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.models.UserRole;
import com.bbu.ai.face_auth.models.EnumRole;
import com.bbu.ai.face_auth.repository.UserRepository;
import com.bbu.ai.face_auth.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {

            UserRole adminRole = roleRepository.findByName(EnumRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new UserRole(EnumRole.ROLE_ADMIN)));

            UserRole userRole = roleRepository.findByName(EnumRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new UserRole(EnumRole.ROLE_USER)));


            // Admin user
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .name("Admin User")
                        .email("admin@example.com")
                        .phoneNumber("0123456789")
                        .roles(Set.of(adminRole, userRole)) // roles are managed
                        .build();
                userRepository.save(admin);
            }

            // Normal user
            if (userRepository.findByUsername("user").isEmpty()) {
                User user = User.builder()
                        .username("user")
                        .password(passwordEncoder.encode("user123"))
                        .name("Normal User")
                        .email("user@example.com")
                        .phoneNumber("0987654321")
                        .roles(Set.of(userRole)) // roles are managed
                        .build();
                userRepository.save(user);
            }

        };
    }
}
