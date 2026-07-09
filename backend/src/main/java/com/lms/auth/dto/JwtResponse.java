package com.lms.auth.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private UUID id;
    private String email;
    private String fullName;
    private String role;

    public JwtResponse(String token, String refreshToken, UUID id, String email, String fullName, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}
