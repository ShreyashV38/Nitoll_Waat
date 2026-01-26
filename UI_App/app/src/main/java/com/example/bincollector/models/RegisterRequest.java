package com.example.bincollector.models;

public class RegisterRequest {
    private String name;
    private String email;
    private String mobile; // New
    private String password;
    private String role;

    private String district;
    private String taluka;
    private String area_name;

    public RegisterRequest(String name, String email, String mobile, String password, String district, String taluka, String area_name) {
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
        this.role = "DRIVER";

        this.district = district;
        this.taluka = taluka;
        this.area_name = area_name;
    }
}