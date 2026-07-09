package com.lms.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import com.lms.security.services.UserDetailsImpl;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private int jwtExpirationMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long jwtRefreshExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        return generateAccessToken(userPrincipal.getEmail());
    }

    /** Short-lived access token used on every request. */
    public String generateAccessToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Long-lived refresh token. Carries a "type":"refresh" claim so an access token
     * can't be replayed at the /auth/refresh endpoint (and vice-versa).
     */
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /** True only for a valid, unexpired token whose "type" claim equals "refresh". */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key()).build()
                    .parseSignedClaims(token).getPayload();
            return "refresh".equals(claims.get("type", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private SecretKey key() {
        // Secret is used as raw UTF-8 bytes (NOT Base64-decoded): a >= 32-character
        // secret => >= 256-bit key, which satisfies HS256's minimum. Base64-decoding
        // a 32-char string silently yielded a 24-byte (192-bit) key and broke signing.
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (JwtException e) {
            // Catch-all for anything else the parser can throw (e.g. a tampered
            // signature -> SignatureException). Ensures validate returns false rather
            // than letting the exception escape.
            log.error("Invalid JWT token: {}", e.getMessage());
        }
        return false;
    }
}
