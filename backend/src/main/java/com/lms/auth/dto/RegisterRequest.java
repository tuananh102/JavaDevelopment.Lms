package com.lms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(max = 255)
    private String fullName;

    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    // NOTE: role is intentionally NOT a bindable field. Public self-registration
    // always creates a STUDENT (forced server-side in AuthController). Allowing the
    // client to choose the role would let anyone register as ADMIN/INSTRUCTOR.
}
