package com.example.bincollector.models;

public class VehicleRequest {
    private String license_plate;
    private String type;

    public VehicleRequest(String license_plate, String type) {
        this.license_plate = license_plate;
        this.type = type;
    }

    public String getLicensePlate() {
        return license_plate;
    }

    public String getType() {
        return type;
    }
}