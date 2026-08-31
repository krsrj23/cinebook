package com.cinebook.service;

import com.cinebook.dto.request.LoginRequest;
import com.cinebook.dto.request.RegisterRequest;
import com.cinebook.dto.response.AuthResponse;
import com.cinebook.dto.response.LoginResponse;
import com.cinebook.entity.Role;
import com.cinebook.entity.User;
import com.cinebook.exception.DuplicateResourceException;
import com.cinebook.exception.InvalidCredentialsException;
import com.cinebook.repository.UserRepository;
import com.cinebook.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .build();

        User saved = userRepository.save(user);

        return new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
