package com.lms.auth;

import com.lms.auth.dto.JwtResponse;
import com.lms.auth.dto.LoginRequest;
import com.lms.auth.dto.RefreshRequest;
import com.lms.auth.dto.RegisterRequest;
import com.lms.common.exception.ConflictException;
import com.lms.security.jwt.JwtUtils;
import com.lms.security.services.UserDetailsImpl;
import com.lms.user.User;
import com.lms.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateAccessToken(userDetails.getEmail());
        String refresh = jwtUtils.generateRefreshToken(userDetails.getEmail());
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_STUDENT");

        return ResponseEntity.ok(new JwtResponse(jwt,
                refresh,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                role));
    }

    /**
     * Exchanges a valid refresh token for a fresh access + refresh token pair (rotation).
     * Returns 401 for a missing/expired/tampered token or one that isn't a refresh token,
     * and for a user that no longer exists or has been deactivated.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshRequest request) {
        String token = request.getRefreshToken();
        if (!jwtUtils.validateJwtToken(token) || !jwtUtils.isRefreshToken(token)) {
            return unauthorized();
        }

        String email = jwtUtils.getUserNameFromJwtToken(token);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.isActive()) {
            return unauthorized();
        }

        String newAccess = jwtUtils.generateAccessToken(email);
        String newRefresh = jwtUtils.generateRefreshToken(email);
        return ResponseEntity.ok(new JwtResponse(newAccess,
                newRefresh,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_" + user.getRole().name()));
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid or expired refresh token"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new ConflictException("Email is already in use");
        }

        // Public self-registration is ALWAYS a STUDENT. The role is never taken from
        // the request body — see RegisterRequest. Instructor/Admin accounts must be
        // provisioned through a trusted path, not this endpoint.
        User user = User.builder()
                .fullName(signUpRequest.getFullName())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(User.Role.STUDENT)
                .isActive(true)
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully!"));
    }
}
