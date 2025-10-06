package com.example.api;

import com.example.data.User;

public class RegistrationRequest {
    private User user;
    private String captcha;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCaptcha() {
        return captcha;
    }

    public void setCaptcha(String captcha) {
        this.captcha = captcha;
    }
}

