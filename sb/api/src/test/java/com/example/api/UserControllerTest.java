package com.example.api;

import com.example.data.User;
import com.example.email.EmailService;
import com.example.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void getUsers_shouldReturnListOfUsers() throws Exception {
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("John Doe");

        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("Jane Doe");

        List<User> users = Arrays.asList(user1, user2);

        when(userService.getUsers()).thenReturn(users);

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(users)));
    }

    @Test
    public void registerUser_shouldReturnCreatedUser() throws Exception {
        User user = new User();
        user.setUsername("John Doe");
        user.setPassword("password");

        User createdUser = new User();
        createdUser.setId(1L);
        createdUser.setUsername("John Doe");

        RegistrationRequest registrationRequest = new RegistrationRequest();
        registrationRequest.setUser(user);
        registrationRequest.setCaptcha("123456");

        when(userService.registerNewUser(any(User.class), any(String.class))).thenReturn(createdUser);

        mockMvc.perform(post("/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("John Doe"));
    }

    @Test
    public void loginUser_shouldReturnSuccessMessage() throws Exception {
        User user = new User();
        user.setUsername("John Doe");
        user.setPassword("password");

        mockMvc.perform(post("/users/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(content().string("User logged in successfully"));
    }
}
