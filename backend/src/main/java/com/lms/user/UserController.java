package com.lms.user;

import com.lms.common.exception.ConflictException;
import com.lms.common.exception.ForbiddenException;
import com.lms.common.exception.ResourceNotFoundException;
import com.lms.security.services.UserDetailsImpl;
import com.lms.user.dto.PasswordChangeRequest;
import com.lms.user.dto.ProfileUpdateRequest;
import com.lms.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Returns the currently authenticated user. Used by the frontend to rehydrate
     * auth state after a page refresh (the JWT survives in localStorage but the user
     * object does not). This path is not in the public allowlist, so it requires a
     * valid token — an anonymous request is rejected with 401 by the security layer.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = loadCurrent(userDetails);
        return ResponseEntity.ok(UserDto.from(user));
    }

    /** Update the authenticated user's own profile (currently just the display name). */
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ProfileUpdateRequest request) {
        User user = loadCurrent(userDetails);
        user.setFullName(request.getFullName().trim());
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }

    /** Change the authenticated user's password after verifying the current one. */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody PasswordChangeRequest request) {
        User user = loadCurrent(userDetails);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ForbiddenException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    // --- Admin-only management ---

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /** Activate/deactivate a user. A deactivated user can no longer log in (is_active gate). */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> setActive(
            @PathVariable UUID id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (id.equals(userDetails.getId())) {
            // Guard against an admin locking themselves out.
            throw new ConflictException("You cannot change your own active status");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }

    private User loadCurrent(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
