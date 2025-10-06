package com.example.api;

import com.example.data.User;
import com.example.email.EmailService;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;
    private final EmailService emailService;

    @Autowired
    public UserController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/users/register/captcha")
    public ResponseEntity<?> sendRegistrationCaptcha(@RequestParam String email) {
        userService.sendRegistrationCaptcha(email);
        return ResponseEntity.ok("Captcha sent to " + email);
    }

    @PostMapping("/users/register")
    public User registerUser(@RequestBody RegistrationRequest registrationRequest) {
        return userService.registerNewUser(registrationRequest.getUser(), registrationRequest.getCaptcha());
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        return ResponseEntity.ok("User logged in successfully");
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getUsers();
    }
}
