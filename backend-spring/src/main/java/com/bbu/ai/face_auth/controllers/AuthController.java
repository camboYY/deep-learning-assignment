package com.bbu.ai.face_auth.controllers;

import com.bbu.ai.face_auth.dto.UserLoginRequest;
import com.bbu.ai.face_auth.dto.UserSignupRequest;
import com.bbu.ai.face_auth.mapper.LoginResponse;
import com.bbu.ai.face_auth.mapper.UserResponse;
import com.bbu.ai.face_auth.models.User;
import com.bbu.ai.face_auth.services.AuthenticationService;
import com.bbu.ai.face_auth.services.JwtCustomService;
import jakarta.validation.Valid;

import org.apache.coyote.BadRequestException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LogManager.getLogger(AuthController.class);

    private final JwtCustomService jwtService;

    private final AuthenticationService authenticationService;

    public AuthController(JwtCustomService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@Valid @RequestBody UserLoginRequest loginUserDto) {
        logger.info("loginUserDto{}", loginUserDto);

        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse(jwtToken,jwtService.getExpirationTime());

        return ResponseEntity.ok(loginResponse);
    }


    @PostMapping("/signup")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserSignupRequest registerUserDto) throws BadRequestException {
        User registeredUser = authenticationService.signup(registerUserDto);
        UserResponse userResponse = new UserResponse(registeredUser);
        logger.info("registerUserDto{}", registerUserDto);

        return ResponseEntity.ok(userResponse);
    }

}
