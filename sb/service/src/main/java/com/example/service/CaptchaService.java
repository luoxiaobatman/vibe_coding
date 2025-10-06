package com.example.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class CaptchaService {

    private final Cache<String, String> captchaCache;
    private final Random random = new Random();

    public CaptchaService() {
        captchaCache = CacheBuilder.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build();
    }

    public String generateCaptcha(String email) {
        String captcha = String.format("%06d", random.nextInt(999999));
        captchaCache.put(email, captcha);
        return captcha;
    }

    public boolean verifyCaptcha(String email, String captcha) {
        String storedCaptcha = captchaCache.getIfPresent(email);
        return storedCaptcha != null && storedCaptcha.equals(captcha);
    }
}

