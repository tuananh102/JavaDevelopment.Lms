package com.lms.user.dto;

import com.lms.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

/**
 * Public-facing view of a user. Deliberately excludes the password hash.
 * The role is emitted WITHOUT the "ROLE_" prefix to match the login response
 * ({@code AuthController}) and what the frontend auth store expects.
 */
@Data
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private boolean active;

    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.isActive());
    }
}
