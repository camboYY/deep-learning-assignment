package com.bbu.ai.face_auth.mapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;

    private long expiresIn;

    void setExpiresIn(long second){
        this.expiresIn  = second;
    }

}
