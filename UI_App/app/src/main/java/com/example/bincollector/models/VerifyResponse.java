package com.example.bincollector.models;

public class VerifyResponse {
    private boolean success;
    private String token;
    private String message;
    private LoginResponse.User user;

    public boolean isSuccess() {
        return success;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }
    public LoginResponse.User getUser() {
        return user;
    }
}