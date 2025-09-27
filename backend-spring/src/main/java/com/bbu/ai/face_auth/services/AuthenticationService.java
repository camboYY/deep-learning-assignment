package com.bbu.ai.face_auth.services;


import com.bbu.ai.face_auth.dto.UserLoginRequest;
import com.bbu.ai.face_auth.dto.UserSignupRequest;

import com.bbu.ai.face_auth.models.EnumRole;
import com.bbu.ai.face_auth.models.UserRole;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.repository.RoleRepository;
import com.bbu.ai.face_auth.repository.UserRepository;
import org.apache.coyote.BadRequestException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthenticationService {

    private static final Logger logger = LogManager.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RoleRepository roleRepository;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder, RoleRepository roleRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public User signup(UserSignupRequest signUpRequest) throws BadRequestException {
        logger.info("signUpRequest{}", signUpRequest);
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw  new BadRequestException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(), passwordEncoder.encode(signUpRequest.getPassword()),
                signUpRequest.getPhoneNumber());

        Set<String> strRoles = signUpRequest.getRole();
        Set<UserRole> roles = new HashSet<>();
        logger.info("roles{}", roles);

        if (strRoles == null) {

            UserRole defaultRole = new UserRole();
            defaultRole.setName(EnumRole.ROLE_USER);

            roles.add(defaultRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        UserRole adminRole = roleRepository.findByName(EnumRole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: UserRole is not found."));
                        roles.add(adminRole);

                        break;
                    case "mod":
                        UserRole modRole = roleRepository.findByName(EnumRole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: UserRole is not found."));
                        roles.add(modRole);

                        break;
                    case "student":
                        UserRole studentRole = roleRepository.findByName(EnumRole.ROLE_STUDENT)
                                .orElseThrow(() -> new RuntimeException("Error: UserRole is not found."));
                        roles.add(studentRole);

                        break;
                    case "teacher":
                        UserRole teacherRole = roleRepository.findByName(EnumRole.ROLE_TEACHER)
                                .orElseThrow(() -> new RuntimeException("Error: UserRole is not found."));
                        roles.add(teacherRole);

                        break;
                    default:
                        UserRole userRole = roleRepository.findByName(EnumRole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: UserRole is not found."));
                        roles.add(userRole);
                }
            });
        }
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setRoles(roles);
        userRepository.save(user);
        return userRepository.save(user);
    }

    public User authenticate(UserLoginRequest input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );

        return userRepository.findByUsername(input.getUsername())
                .orElseThrow();
    }
}
