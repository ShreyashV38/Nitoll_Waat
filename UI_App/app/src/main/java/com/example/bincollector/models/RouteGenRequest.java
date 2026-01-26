package com.example.bincollector.models;

public class RouteGenRequest {
    private double latitude;
    private double longitude;
    private String dumping_zone_id;

    public RouteGenRequest(double latitude, double longitude, String dumping_zone_id) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.dumping_zone_id = dumping_zone_id;
    }
}