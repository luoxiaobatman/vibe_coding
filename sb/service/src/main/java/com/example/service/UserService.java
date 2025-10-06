package com.example.service;

import com.example.data.User;
import com.example.data.UserRepository;
import com.example.email.EmailService;
import com.example.service.CaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CaptchaService captchaService;
    private final EmailService emailService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CaptchaService captchaService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.captchaService = captchaService;
        this.emailService = emailService;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User registerNewUser(User user, String captcha) {
        if (!captchaService.verifyCaptcha(user.getUsername(), captcha)) {
            throw new RuntimeException("Invalid captcha");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void sendRegistrationCaptcha(String email) {
        String captcha = captchaService.generateCaptcha(email);
        emailService.sendEmail(email, "Registration Captcha", "Your captcha is: " + captcha);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return user;
    }
}
