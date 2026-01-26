package com.example.bincollector.models;

public class ProfileResponse {
    private LoginResponse.User user;
    private VehicleInfo vehicle;

    public LoginResponse.User getUser() { return user; }
    public VehicleInfo getVehicle() { return vehicle; }

    // Inner class for Vehicle Data
    public static class VehicleInfo {
        private String license_plate;
        private String type;
        private String status;

        public String getLicensePlate() { return license_plate; }
        public String getType() { return type; }
        public String getStatus() { return status; }
    }
}