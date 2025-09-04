package com.bbu.ai.face_auth.mapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;

    private long expiresIn;

    void setExpiresIn(long second){
        this.expiresIn  = second;
    }

}
