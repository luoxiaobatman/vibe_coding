package com.example.api;

import com.example.data.User;
import com.example.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerRegistrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("user", "password"))
            .withPerMethodLifecycle(false);

    @Test
    void testRegisterUserAndSendsEmail() throws Exception {
        String email = "test@example.com";
        String password = "password";

        // 1. Request captcha
        mockMvc.perform(post("/users/register/captcha")
                        .param("email", email))
                .andExpect(status().isOk());

        // 2. Get captcha from email
        MimeMessage[] receivedMessages = greenMail.getReceivedMessages();
        assertEquals(1, receivedMessages.length);
        MimeMessage receivedMessage = receivedMessages[0];
        String content = (String) receivedMessage.getContent();
        String captcha = content.substring(content.lastIndexOf(" ") + 1);

        // 3. Register user with captcha
        User user = new User();
        user.setUsername(email);
        user.setPassword(password);
        RegistrationRequest registrationRequest = new RegistrationRequest();
        registrationRequest.setUser(user);
        registrationRequest.setCaptcha(captcha);

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationRequest)))
                .andExpect(status().isOk());

        // 4. Verify welcome email
        receivedMessages = greenMail.getReceivedMessages();
        assertEquals(2, receivedMessages.length); // Captcha email + Welcome email
        MimeMessage welcomeMessage = receivedMessages[1];
        assertEquals("Welcome to our platform!", welcomeMessage.getSubject());
        assertEquals(email, welcomeMessage.getAllRecipients()[0].toString());
    }
}

